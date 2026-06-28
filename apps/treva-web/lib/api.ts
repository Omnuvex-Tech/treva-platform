import { ApiClient } from "@/classes/api-client";
import { config } from "@/config";

export const api = new ApiClient();
export const trevaApi = new ApiClient(config.api.trevaUrl);
