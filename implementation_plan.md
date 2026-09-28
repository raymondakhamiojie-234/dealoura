# Escrow Agent Workflow Migration

Currently, Dealoura uses a pure peer-to-peer escrow model. The buyer pays into escrow, the seller transfers directly to the buyer, and the buyer confirms receipt. 

To mimic DealBaron's workflow, we need to introduce the concept of an "Escrow Agent" into the middle of the flow, along with a 7-day evaluation period.

## Proposed Changes

### 1. Database Schema
We need to add three new transaction statuses to the `transaction_status` enum:
- `agent_verifying`: The seller has transferred the account to the marketplace Escrow Agent. The agent is verifying the details.
- `buyer_7_day_evaluation`: The agent has granted the buyer Manager access for the 7-day mandatory evaluation period.
- `agent_finalizing`: The 7 days have passed, and the agent is assigning primary ownership.

*Note: Since PostgreSQL does not allow modifying or dropping enum values in place easily without creating a new type or using `ALTER TYPE ... ADD VALUE`, we will add these new values to the existing `transaction_status` enum.*

### 2. Transaction Workflow Updates (`transactions.ts` & `dashboard/transactions/[id]/page.tsx`)

The new flow will look like this:

1. **`pending_payment`**: Buyer pays. (No change)
2. **`payment_confirmed`**: Instead of the seller transferring directly to the buyer, the UI will instruct the seller to transfer ownership to the *Dealoura Escrow Agent* (e.g., `escrow@dealoura.com`). Once done, the seller clicks "Transferred to Agent".
    - State changes to: `agent_verifying`
3. **`agent_verifying`**: The system (simulating an admin) needs a way to confirm receipt. We will add an "Admin Simulate" button for now that allows us to simulate the Agent verifying the account and granting the buyer Manager access.
    - State changes to: `buyer_7_day_evaluation`
4. **`buyer_7_day_evaluation`**: The buyer evaluates the account. They will have a button "I am satisfied (Trigger 7-Day Completion)". (In a real app, this would be an automated cron job or Admin action, but we will add a manual trigger for the buyer to fast-forward time).
    - State changes to: `completed`

### 3. UI Changes
- Update the transaction details page to render the new state alerts and action buttons.
- Update the timeline descriptions to clearly reflect the Escrow Agent's involvement.

## Verification Plan

- Create a test transaction.
- Pay as the buyer.
- Verify the seller is prompted to transfer to the Escrow Agent.
- Simulate the Escrow Agent verifying.
- Simulate the 7-day completion.
- Verify the final payout/completed state.
