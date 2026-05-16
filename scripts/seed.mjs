import fs from "node:fs";
import path from "node:path";

import { faker } from "@faker-js/faker";
import { createClient } from "@supabase/supabase-js";

function loadDotEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    const value = t.slice(i + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function main() {
  loadDotEnvLocal();

  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
  const secret =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error("Missing env: SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)");
  }

  const supabase = createClient(url, secret, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  faker.seed(42);

  // 1) Create 10 users (profiles are created by your DB trigger)
  const userIds = [];
  for (let i = 0; i < 10; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const usernameBase = faker.internet.username({ firstName, lastName }).toLowerCase();
    const username = `${usernameBase}${faker.number.int({ min: 10, max: 9999 })}`;
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const password = "Password123!"; // dev-only seed password

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        // not used for authz; just helpful seed info
        seed: true,
      },
    });

    if (error) {
      // If you re-run seeds, emails may already exist. Skip duplicates.
      const msg = String(error.message ?? error);
      if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("exists")) {
        continue;
      }
      throw new Error(`createUser failed: ${msg}`);
    }

    const id = data.user?.id;
    if (!id) throw new Error("createUser returned no user id");
    userIds.push(id);

    // 1b) Update the profile row with faker data
    const dob = faker.date.birthdate({ min: 18, max: 55, mode: "age" });
    const avatarUrl = faker.image.avatar();

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id,
          username,
          first_name: firstName,
          last_name: lastName,
          dob: dob.toISOString().slice(0, 10),
          avatar_url: avatarUrl,
        },
        { onConflict: "id" }
      );

    if (profileError) {
      throw new Error(`profile upsert failed: ${profileError.message}`);
    }
  }

  if (userIds.length === 0) {
    throw new Error(
      "No users were created. If users already exist, delete seed users or change the seed email generation."
    );
  }

  // 2) Create 20 decks assigned randomly to users
  const decksToInsert = Array.from({ length: 20 }, () => {
    const userId = faker.helpers.arrayElement(userIds);
    return {
      user_id: userId,
      title: faker.lorem.words({ min: 2, max: 5 }),
      is_public: faker.datatype.boolean(0.25),
    };
  });

  const { data: decks, error: decksError } = await supabase
    .from("decks")
    .insert(decksToInsert)
    .select("id,user_id");

  if (decksError) {
    throw new Error(`decks insert failed: ${decksError.message}`);
  }

  // 3) Create 10 cards per deck (position controls study order)
  const cardsToInsert = [];
  for (const deck of decks ?? []) {
    for (let position = 0; position < 10; position++) {
      cardsToInsert.push({
        deck_id: deck.id,
        position,
        front: faker.lorem.sentence({ min: 4, max: 10 }),
        back: faker.lorem.paragraph({ min: 1, max: 3 }),
      });
    }
  }

  const { error: cardsError } = await supabase.from("cards").insert(cardsToInsert);
  if (cardsError) {
    throw new Error(`cards insert failed: ${cardsError.message}`);
  }

  console.log("Seed complete:");
  console.log(`- users created: ${userIds.length}`);
  console.log(`- decks created: ${decks?.length ?? 0}`);
  console.log(`- cards created: ${cardsToInsert.length}`);
  console.log("- seed user password: Password123!");
}

main().catch((e) => {
  console.error(e?.message ?? e);
  process.exit(1);
});

