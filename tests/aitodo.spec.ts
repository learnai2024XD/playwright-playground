import { expect } from '@playwright/test';
import { test } from '../fixture';


// test.describe('aiToDo', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('https://demo.playwright.dev/todomvc/#/');
        await page.waitForLoadState('networkidle');
    });

    test('添加新的代辦事項', async ({ ai, aiQuery, aiAssert }) => {
        await ai("在輸入框中輸入學習playwright並按下enter")

        const items = await aiQuery(
            '{itemTitle:string}[],查找代辦事項列表中的項目標題'
        );
        console.log('代辦事項列表', items);
        expect(items?.length).toBeGreaterThan(0);
        await aiAssert("在代辦列表中會看到 吃晚餐的代辦事項");
    })
// })

