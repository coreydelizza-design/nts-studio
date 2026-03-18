/**
 * State barrel — canonical import path for store access.
 * Usage: import { useWorkshopStore } from '@/state';
 *
 * Currently re-exports from the original store location.
 * Future slices can be added here as the store grows.
 */
export { useWorkshopStore } from '../store/useWorkshopStore';
