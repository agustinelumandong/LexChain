# Role-Based Access Control (RBAC) with Laravel Spatie Permission

The package is `spatie/-permission` — the most popular Laravel package for managing roles and permissions.

## Core Concepts

```
User  ──has many──▶  Roles  ──has many──▶  Permissions

User  ──can also directly have──▶  Permissions
```

There are 3 main entities:

| Entity | Description |
|--------|-------------|
| **Permission** | A specific action (e.g. `edit posts`, `delete users`) |
| **Role** | A group of permissions (e.g. `Admin`, `Editor`) |
| **User** | Can be assigned roles and/or direct permissions |

## How It Behaves

### 1. Assigning Roles to a User

```php
$user->assignRole('editor');
$user->assignRole(['editor', 'writer']); // multiple roles
```

### 2. Assigning Permissions to a Role

```php
$role = Role::create(['name' => 'editor']);
$role->givePermissionTo('edit posts');
$role->givePermissionTo(['edit posts', 'delete posts']); // multiple
```

### 3. Assigning Direct Permissions to a User

```php
$user->givePermissionTo('publish posts'); // bypasses roles
```

## Permission Check Behavior

Spatie checks permissions in two ways:

```php
// Via role (indirect)
$user->assignRole('editor'); // editor has 'edit posts'
$user->can('edit posts');    // ✅ true

// Via direct permission
$user->givePermissionTo('delete posts');
$user->can('delete posts');  // ✅ true

// No role, no direct permission
$user->can('manage users');  // ❌ false
```

**Key behavior:** A user has a permission if it's granted directly OR through any of their assigned roles.

## Middleware Protection

Spatie provides built-in middleware to protect routes:

```php
// Protect by role
Route::get('/dashboard', fn() => ...)->middleware('role:admin');

// Protect by permission
Route::get('/posts/edit', fn() => ...)->middleware('permission:edit posts');

// Multiple (OR logic)
Route::get('/posts', fn() => ...)->middleware('role:admin|editor');

// Multiple (AND logic)
Route::get('/posts', fn() => ...)
  ->middleware(['role:admin', 'permission:edit posts']);
```

## Role Hierarchy Behavior

⚠️ **Spatie does NOT have built-in role hierarchy.** An admin role does not automatically inherit editor permissions. You must assign permissions explicitly.

```php
// You must manually assign all permissions per role
$adminRole->givePermissionTo(['edit posts', 'delete posts', 'manage users']);
$editorRole->givePermissionTo(['edit posts']);
```

## Guards Behavior (Multi-Auth)

Spatie supports multiple guards (e.g., `web`, `api`):

```php
// Create role/permission for a specific guard
Role::create(['name' => 'admin', 'guard_name' => 'api']);
Permission::create(['name' => 'edit posts', 'guard_name' => 'web']);
```

Roles and permissions are scoped to their guard — a web role won't work for api guard users.

## Database Tables Created

| Table | Purpose |
|-------|---------|
| `roles` | Stores all roles |
| `permissions` | Stores all permissions |
| `model_has_roles` | Pivot: User ↔ Role |
| `model_has_permissions` | Pivot: User ↔ Direct Permission |
| `role_has_permissions` | Pivot: Role ↔ Permission |

