# Prompt: Wire GTT Inventory to Store

## Purpose
Move GTT service inventory from local useState in EstateMapper to Zustand store
for downstream consumption by Architecture Studio.

## Files Modified
- src/types/index.ts (add GttService interface)
- src/data/seed.ts (export INITIAL_GTT_SERVICES)
- src/store/useWorkshopStore.ts (add gttServices state)
- src/components/sections/estate-mapper/EstateMapper.tsx (read from store)

## Status: NOT YET APPLIED
See conversation history for the full prompt.
