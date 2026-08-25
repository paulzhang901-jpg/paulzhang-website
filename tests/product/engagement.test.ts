import test from "node:test";
import assert from "node:assert/strict";
import { advanceEngagement, initialEngagementState } from "../../src/lib/engagement/policy";
import { validateProductEventPayload } from "../../src/lib/measurement/events";

test("hidden or inactive time does not accumulate", () => { const result = advanceEngagement(initialEngagementState, false); assert.equal(result.next.seconds, 0); });
test("active visible time accumulates and reaches five minutes once", () => { const state = {...initialEngagementState, seconds: 299}; const result = advanceEngagement(state, true); assert.equal(result.fiveReached, true); assert.equal(result.next.fiveMinuteShown, true); assert.equal(advanceEngagement(result.next, true).fiveReached, false); });
test("ten-minute prompt is eligible once", () => { const state = {...initialEngagementState, seconds: 599, fiveMinuteShown: true}; const result = advanceEngagement(state, true); assert.equal(result.tenReached, true); assert.equal(advanceEngagement(result.next, true).tenReached, false); });
test("dismissal and deeper grow action suppress five-minute prompt", () => { assert.equal(advanceEngagement({...initialEngagementState, seconds: 299, fiveMinuteDismissed: true}, true).fiveReached, false); assert.equal(advanceEngagement({...initialEngagementState, seconds: 299, startedGrow: true}, true).fiveReached, false); });
test("event payload rejects intimate or free-text fields", () => { assert.throws(() => validateProductEventPayload({prayer_text: "private"})); assert.throws(() => validateProductEventPayload({email: "person@example.test"})); assert.equal(validateProductEventPayload({journey_id: "faith", locale: "zh-CN", source: "start"}), true); });
test("event payload values cannot smuggle free text", () => { assert.throws(() => validateProductEventPayload({source: "my private reflection"})); assert.throws(() => validateProductEventPayload({destination_type: "health concern"})); });
