declare global {
	namespace App {
		interface Locals {
			token?: string;
			roles?: string[];
		}
	}
}

declare module "jsonwebtoken";

export {};
