import { json } from "@sveltejs/kit";
import { userCheck } from "$lib/components/forms/auth/username-check";

/** @type {import("./$types").RequestHandler} */
export const POST = async ({ request, fetch }) => {
    const body = await request.json().catch(() => null);
    if (typeof body?.username !== "string" || body.username.length < 3) {
        return json({ error: "Enter a username with at least 3 characters." }, { status: 400 });
    }
    try {
        return json(await userCheck(body.username, fetch), { headers: { "Cache-Control": "no-store" } });
    } catch {
        return json({ error: "We couldn't check this username. Please try again." }, { status: 503 });
    }
};
