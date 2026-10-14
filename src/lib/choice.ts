import type { ModelChoiceOut } from "../content/types";
import type { ModelChoice } from "./models-fetch";

export const choiceOut = (c: ModelChoice | null): ModelChoiceOut | null =>
  c && { provider: c.provider, model: c.model, allow_fallback: !!c.allow_fallback, fallback_provider: c.fallback_provider, fallback_model: c.fallback_model };
