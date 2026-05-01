# Whitelist FlatList Migration Guide

Use this only when backend data makes whitelist grants large enough that `.map()` inside the bottom sheet becomes slow.

## When To Implement

Keep the current `.map()` version while:
- grants are local/mock data
- each document has only a small number of grants
- there is no visible scroll or render lag in the bottom sheet

Switch to a virtualized list when:
- a document can have dozens or hundreds of grants
- add/revoke actions cause visible lag
- opening the manage-whitelist sheet feels slow
- backend pagination or search starts returning large grant lists

## Target File

```txt
src/features/document/components/manage-whitelist-bottom-sheet.tsx
```

## Step 1: Import BottomSheetFlatList

Replace:

```ts
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
```

with:

```ts
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
```

## Step 2: Extract Render Helpers

Inside `ManageWhitelistBottomSheet`, add:

```ts
const renderGrant = ({ item: grant }: { item: ManageWhitelistData['grants'][number] }) => (
  <WhitelistGrantRow
    name={grant.name}
    accessLabel={grant.accessLabel}
    actionLabel={grant.actionLabel}
    onPressAction={() => onPressGrantAction?.(grant.id)}
    onPressRevoke={() => onPressRevoke?.(grant.id)}
  />
);

const keyExtractor = (grant: ManageWhitelistData['grants'][number]) => grant.id;
```

If the list starts rerendering too much, wrap both with `useCallback`.

## Step 3: Replace The Grants `.map()`

Replace:

```tsx
<View style={styles.grantsList}>
  {data.grants.map((grant) => (
    <WhitelistGrantRow
      key={grant.id}
      name={grant.name}
      accessLabel={grant.accessLabel}
      actionLabel={grant.actionLabel}
      onPressAction={() => onPressGrantAction?.(grant.id)}
      onPressRevoke={() => onPressRevoke?.(grant.id)}
    />
  ))}
</View>
```

with:

```tsx
<BottomSheetFlatList
  data={data.grants}
  keyExtractor={keyExtractor}
  renderItem={renderGrant}
  ItemSeparatorComponent={() => <View style={styles.grantSeparator} />}
  scrollEnabled={data.grants.length > 6}
  nestedScrollEnabled
  initialNumToRender={8}
  maxToRenderPerBatch={8}
  windowSize={5}
  removeClippedSubviews
/>
```

## Step 4: Add Separator Style

Add this style:

```ts
grantSeparator: {
  height: 10,
},
```

## Step 5: Watch Bottom Sheet Behavior

After switching, manually test:
- sheet opens at the correct height
- search dropdown still appears above the grant list
- grant action buttons still work
- revoke buttons still work
- Android back closes the sheet
- keyboard search does not hide the results list

If the list fights with sheet scrolling, keep the outer `BottomSheetScrollView` for header/search and only virtualize once the sheet layout is split into a fixed header plus list body.
