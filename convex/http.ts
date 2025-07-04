import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { api } from "./_generated/api";

const http = httpRouter();

const clerkWebhook = httpAction(async (ctx, request) => {
  const webhookSecreat = process.env.CLEARK_WEBHOOK_SECRET;

  if (!webhookSecreat) {
    throw new Error("Missing webhooke secreat");
  }

  const svix_id = request.headers.get("svix-id");
  const svix_signature = request.headers.get("svix-signature");
  const svix_timestamp = request.headers.get("svix-timestamp");
  if (!svix_id || !svix_signature || !svix_timestamp) {
    return new Response("Missing required headers", {
      status: 400,
    });
  }

  const payload = await request.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(webhookSecreat);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-signature": svix_signature,
      "svix-timestamp": svix_timestamp,
    }) as WebhookEvent;
  } catch (error) {
    console.error("Webhook verification failed:", error);
    return new Response("Invalid signature", {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address || "";
    const name = `${first_name || ""} ${last_name || ""}`.trim();
    const clerkId = id;

    try {
      await ctx.runMutation(api.users.createUser, {
        email,
        name,
        clerkId,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      return new Response("Error creating user", {
        status: 500,
      });
    }
  }

  return new Response("User created successfully", {
    status: 200,
  });
});

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: clerkWebhook,
});

export default http;
