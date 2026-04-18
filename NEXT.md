# Next Steps

## Firebase Integration

Add Firebase for cloud sync so data persists across devices.

### What to add:
- [ ] Firebase Firestore for storing task completion state
- [ ] Firebase Auth (optional) for multi-device sync
- [ ] Real-time listeners for instant updates

### Data to sync:
- `completedTasks` per day
- `notes` per day
- `reflection` per day
- Theme preference

### Migration path:
1. Keep localStorage as fallback
2. Add Firebase SDK
3. Sync on login, merge with local state
4. Prioritize server state on conflict

### Packages needed:
```bash
npm install firebase
```

### Files to modify:
- `src/hooks/useLocalStorage.ts` → Add Firebase hooks
- `src/app/layout.tsx` → Initialize Firebase
- Create `src/lib/firebase.ts` for config
