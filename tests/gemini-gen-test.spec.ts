import { test, expect } from '@playwright/test';

test.describe('TodoMVC', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/#/');
  });

  test.describe('New Todo', () => {
    test('should allow me to add todo items', async ({ page }) => {
      // Create 1st todo.
      await page.locator('.new-todo').fill('buy some cheese');
      await page.locator('.new-todo').press('Enter');

      // Make sure the list only has one todo item.
      await expect(page.locator('.view label')).toHaveText(['buy some cheese']);

      // Create 2nd todo.
      await page.locator('.new-todo').fill('feed the cat');
      await page.locator('.new-todo').press('Enter');

      // Make sure the list now has two todo items.
      await expect(page.locator('.view label')).toHaveText([
        'buy some cheese',
        'feed the cat',
      ]);
    });

    test('should clear text input field when an item is added', async ({ page }) => {
      // Create one todo item.
      await page.locator('.new-todo').fill('buy some cheese');
      await page.locator('.new-todo').press('Enter');

      // Check that input is empty.
      await expect(page.locator('.new-todo')).toBeEmpty();
    });

    test('should not add empty or whitespace-only todos', async ({ page }) => {
      const todoInput = page.locator('.new-todo');
      const todoList = page.locator('.todo-list');

      // Attempt to add an empty todo
      await todoInput.press('Enter');
      await expect(todoList).toBeEmpty();

      // Attempt to add a whitespace-only todo
      await todoInput.fill('   ');
      await todoInput.press('Enter');
      await expect(todoList).toBeEmpty();
    });

    test('should handle long todo text', async ({ page }) => {
      const longText = 'This is a very long todo text that exceeds a reasonable length to test how the application handles it.';
      await page.locator('.new-todo').fill(longText);
      await page.locator('.new-todo').press('Enter');
      await expect(page.locator('.view label')).toContainText(longText);
    });

    test('should handle special character', async ({ page }) => {
      const specialText = '`~!@#$%^&*()_+=-[]\{}|;\':",./<>?';
      await page.locator('.new-todo').fill(specialText);
      await page.locator('.new-todo').press('Enter');
      await expect(page.locator('.view label')).toContainText(specialText);
    });

    test('should handle html tag', async ({ page }) => {
      const htmlText = '<script>alert("XSS")</script>';
      await page.locator('.new-todo').fill(htmlText);
      await page.locator('.new-todo').press('Enter');
      await expect(page.locator('.view label')).toContainText(htmlText);
      await expect(page.locator('.view label')).not.toContainText('<script>');
    });
  });

  test.describe('Marking Todos', () => {
    test('should allow me to mark items as complete', async ({ page }) => {
      // Create two todos.
      await page.locator('.new-todo').fill('buy some cheese');
      await page.locator('.new-todo').press('Enter');
      await page.locator('.new-todo').fill('feed the cat');
      await page.locator('.new-todo').press('Enter');

      // Check first todo.
      await page.locator('.todo-list li .toggle').first().check();
      await expect(page.locator('.todo-list li').first()).toHaveClass(/completed/);

      // Check second todo.
      await page.locator('.todo-list li .toggle').nth(1).check();
      await expect(page.locator('.todo-list li').nth(1)).toHaveClass(/completed/);
    });

     test('should allow me to un-mark items as complete', async ({ page }) => {
      // Create two todos.
      await page.locator('.new-todo').fill('buy some cheese');
      await page.locator('.new-todo').press('Enter');
      await page.locator('.new-todo').fill('feed the cat');
      await page.locator('.new-todo').press('Enter');

      // Check first todo.
      const firstTodo =  page.locator('.todo-list li').first();
      await firstTodo.locator('.toggle').check();
      await expect(firstTodo).toHaveClass(/completed/);

      // Un-Check first todo.
      await firstTodo.locator('.toggle').uncheck();
      await expect(firstTodo).not.toHaveClass(/completed/);
    });
  });
  test.describe('Item counter', () => {
      test('should display the current number of todo items', async ({ page }) => {
        // Create one todo item.
        await page.locator('.new-todo').fill('buy some cheese');
        await page.locator('.new-todo').press('Enter');

        // Check that counter is displayed
        await expect(page.locator('.todo-count')).toContainText('1');
        await expect(page.locator('.todo-count strong')).toHaveText("1");

        // Create another todo item.
        await page.locator('.new-todo').fill('feed the cat');
        await page.locator('.new-todo').press('Enter');

        // Check that counter is displayed
        await expect(page.locator('.todo-count')).toContainText('2');
        await expect(page.locator('.todo-count strong')).toHaveText("2");
      });
  });

  test.describe('Editing', () => {
      test('should hide other controls when editing', async ({ page }) => {
      // Create one todo item.
      await page.locator('.new-todo').fill('buy some cheese');
      await page.locator('.new-todo').press('Enter');
      const todoItem = page.locator('.todo-list li');
      await todoItem.dblclick();
      await expect(todoItem.locator('.toggle')).not.toBeVisible();
      await expect(todoItem.locator('label', {
        hasText: 'buy some cheese'
      })).not.toBeVisible();
    });

    test('should save edits on blur', async ({ page }) => {
      // Create one todo item.
      await page.locator('.new-todo').fill('buy some cheese');
      await page.locator('.new-todo').press('Enter');
      const todoItem = page.locator('.todo-list li');
      await todoItem.dblclick();
      await page.locator('.edit').fill('buy some sausages');
      await page.locator('.edit').dispatchEvent('blur');
      await expect(page.locator('.view label')).toHaveText(['buy some sausages']);
    });

     test('should trim entered text', async ({ page }) => {
        // Create one todo item.
        await page.locator('.new-todo').fill('buy some cheese');
        await page.locator('.new-todo').press('Enter');

        const todoItem = page.locator('.todo-list li');

        // Edit todo.
        await todoItem.dblclick();
        await page.locator('.edit').fill('    buy some sausages    ');
        await page.locator('.edit').press('Enter');

        // Check that the text is trimmed.
        await expect(page.locator('.view label')).toHaveText(['buy some sausages']);
     });

    test('should remove the item if an empty text string was entered', async ({ page }) => {
      // Create one todo item.
      await page.locator('.new-todo').fill('buy some cheese');
      await page.locator('.new-todo').press('Enter');
      const todoItem = page.locator('.todo-list li');
      await todoItem.dblclick();
      await page.locator('.edit').fill('');
      await page.locator('.edit').press('Enter');
      await expect(page.locator('.view label')).toHaveCount(0);

    });
    test('should cancel edits on escape', async ({ page }) => {
        // Create one todo item.
        await page.locator('.new-todo').fill('buy some cheese');
        await page.locator('.new-todo').press('Enter');

        const todoItem = page.locator('.todo-list li');

        // Edit todo.
        await todoItem.dblclick();
        await page.locator('.edit').press('Escape');

        // Check that the todo is still displayed.
        await expect(page.locator('.view label')).toHaveText(['buy some cheese']);
    });
  });


  test.describe('Toggling all', () => {
    test('should allow me to mark all items as completed', async ({ page }) => {
      // Create two todos.
      await page.locator('.new-todo').fill('buy some cheese');
      await page.locator('.new-todo').press('Enter');
      await page.locator('.new-todo').fill('feed the cat');
      await page.locator('.new-todo').press('Enter');

      // Check 'toggle all' checkbox.
      await page.locator('.toggle-all').check();

      // Check that all items are completed.
      await expect(page.locator('.todo-list li')).toHaveClass([/completed/, /completed/]);
    });

    test('should allow me to clear the complete state of all items', async ({ page }) => {
       // Create two todos.
        await page.locator('.new-todo').fill('buy some cheese');
        await page.locator('.new-todo').press('Enter');
        await page.locator('.new-todo').fill('feed the cat');
        await page.locator('.new-todo').press('Enter');

        // Check 'toggle all' checkbox.
        await page.locator('.toggle-all').check();
        await expect(page.locator('.todo-list li')).toHaveClass([/completed/, /completed/]);
        // Un-Check 'toggle all' checkbox.
        await page.locator('.toggle-all').uncheck();
      // Check that all items are not completed.
      await expect(page.locator('.todo-list li')).not.toHaveClass(/completed/);
    });

    test('complete all checkbox should update state when items are completed / cleared', async ({ page }) => {
       // Create two todos.
        await page.locator('.new-todo').fill('buy some cheese');
        await page.locator('.new-todo').press('Enter');
        await page.locator('.new-todo').fill('feed the cat');
        await page.locator('.new-todo').press('Enter');
        const toggleAll = page.locator('.toggle-all');
        await toggleAll.check();
        await expect(toggleAll).toBeChecked();
        await toggleAll.uncheck();
        await expect(toggleAll).not.toBeChecked();

        // Check first todo.
        await page.locator('.todo-list li .toggle').first().check();
        await expect(toggleAll).not.toBeChecked();

        // Check second todo.
        await page.locator('.todo-list li .toggle').nth(1).check();

        // "Toggle all" check box should be checked.
        await expect(toggleAll).toBeChecked();

    });
  });

  test.describe('Clear completed button', () => {
    test('should display the number of completed items', async ({ page }) => {
        // Create two todos.
        await page.locator('.new-todo').fill('buy some cheese');
        await page.locator('.new-todo').press('Enter');
        await page.locator('.new-todo').fill('feed the cat');
        await page.locator('.new-todo').press('Enter');

        // Check first todo.
        await page.locator('.todo-list li .toggle').first().check();

        // Check that the clear button is visible.
        await expect(page.locator('.clear-completed')).toBeVisible();
        await expect(page.locator('.clear-completed')).toHaveText("Clear completed");

    });
    test('should remove completed items when clicked', async ({ page }) => {
        // Create two todos.
        await page.locator('.new-todo').fill('buy some cheese');
        await page.locator('.new-todo').press('Enter');
        await page.locator('.new-todo').fill('feed the cat');
        await page.locator('.new-todo').press('Enter');

        // Check first todo.
        await page.locator('.todo-list li .toggle').first().check();

        // Click the "Clear completed" button.
        await page.locator('.clear-completed').click();

        // Check that only one todo item is visible.
        await expect(page.locator('.view label')).toHaveText(['feed the cat']);

    });
    test('should be hidden when there are no items that are completed', async ({ page }) => {
        // Create one todo item.
        await page.locator('.new-todo').fill('buy some cheese');
        await page.locator('.new-todo').press('Enter');

        // Check that the clear button is hidden.
        await expect(page.locator('.clear-completed')).toBeHidden();
    });
  });

   test.describe('Routing', () => {
    test('should allow me to display active items', async ({ page }) => {
        // Create two todos.
        await page.locator('.new-todo').fill('buy some cheese');
        await page.locator('.new-todo').press('Enter');
        await page.locator('.new-todo').fill('feed the cat');
        await page.locator('.new-todo').press('Enter');
         // Check first todo.
        await page.locator('.todo-list li .toggle').first().check();

        // Click the "Active" filter button.
        await page.locator('.filters >> text=Active').click();

        // Check that only one todo item is visible.
        await expect(page.locator('.view label')).toHaveCount(1);
        await expect(page.locator('.view label')).toHaveText(['feed the cat']);

    });

     test('should respect the back button', async ({ page }) => {
        // Create two todos.
        await page.locator('.new-todo').fill('buy some cheese');
        await page.locator('.new-todo').press('Enter');
        await page.locator('.new-todo').fill('feed the cat');
        await page.locator('.new-todo').press('Enter');
         // Check first todo.
        await page.locator('.todo-list li .toggle').first().check();

        // Click the "Active" filter button.
        await page.locator('.filters >> text=Active').click();
        await page.locator('.filters >> text=Completed').click();
        await expect(page.locator('.view label')).toHaveCount(1);

        await page.goBack();
        await expect(page.locator('.view label')).toHaveCount(1);
        await expect(page.locator('.view label')).toHaveText(['feed the cat']);


        await page.goBack();
        await expect(page.locator('.view label')).toHaveCount(2);


    });
    test('should allow me to display completed items', async ({ page }) => {
         // Create two todos.
        await page.locator('.new-todo').fill('buy some cheese');
        await page.locator('.new-todo').press('Enter');
        await page.locator('.new-todo').fill('feed the cat');
        await page.locator('.new-todo').press('Enter');
         // Check first todo.
        await page.locator('.todo-list li .toggle').first().check();

        // Click the "Completed" filter button.
        await page.locator('.filters >> text=Completed').click();

        // Check that only one todo item is visible.
        await expect(page.locator('.view label')).toHaveCount(1);
        await expect(page.locator('.view label')).toHaveText(['buy some cheese']);
    });

    test('should allow me to display all items', async ({ page }) => {
      // Create two todos.
        await page.locator('.new-todo').fill('buy some cheese');
        await page.locator('.new-todo').press('Enter');
        await page.locator('.new-todo').fill('feed the cat');
        await page.locator('.new-todo').press('Enter');
        // Check first todo.
        await page.locator('.todo-list li .toggle').first().check();

        // Click the "Active" filter button.
        await page.locator('.filters >> text=Active').click();

        // Click the "All" filter button.
        await page.locator('.filters >> text=All').click();

        // Check that two todo items are visible.
        await expect(page.locator('.view label')).toHaveCount(2);
        await expect(page.locator('.view label')).toHaveText(['buy some cheese', 'feed the cat']);

    });

    test('should highlight the currently applied filter', async ({ page }) => {
      await expect(page.locator('.filters >> text=All')).toHaveClass(/selected/);

        // Click the "Active" filter button.
        await page.locator('.filters >> text=Active').click();

        // "Active" filter button should be highlighted.
        await expect(page.locator('.filters >> text=Active')).toHaveClass(/selected/);

        // Click the "Completed" filter button.
        await page.locator('.filters >> text=Completed').click();

        // "Completed" filter button should be highlighted.
        await expect(page.locator('.filters >> text=Completed')).toHaveClass(/selected/);
    });
 });

 test.describe('Delete item', () => {
    test('should delete an item', async ({ page }) => {
      // Create one todo item.
      await page.locator('.new-todo').fill('buy some cheese');
      await page.locator('.new-todo').press('Enter');

      // Hover over the todo item.
      await page.locator('.view label', {
        hasText: 'buy some cheese'
      }).hover();

      // Click the "destroy" button.
      await page.locator('.destroy').click({force: true});

      // Check that the todo item is no longer visible.
      await expect(page.locator('.view label', {
        hasText: 'buy some cheese'
      })).not.toBeVisible();
    });
 });
});