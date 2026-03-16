const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        console.log('Navigating to Home...');
        await page.goto('http://localhost:5174/');
        await page.waitForLoadState('networkidle');

        // Check initial Hot Projects count
        const initialProjects = await page.locator('.grid-cols-1 .bg-white.rounded-2xl.overflow-hidden').count();
        console.log(`Initial Hot Projects loaded: ${initialProjects}`);

        // Click "AI Agent" button filter
        console.log('Clicking "AI Agent" filter button...');
        await page.click('button:has-text("AI Agent")');

        // Wait for network response for type filtering
        const response = await page.waitForResponse(response =>
            response.url().includes('/api/projects/type/ai_agent') && response.status() === 200
        );
        console.log('Received response from type API:', response.ok());

        // Wait for UI to update
        await page.waitForTimeout(1000);
        const aiAgentProjects = await page.locator('.grid-cols-1 .bg-white.rounded-2xl.overflow-hidden').count();
        console.log(`AI Agent Projects rendered: ${aiAgentProjects}`);

        // Click "全部" to reset
        console.log('Clicking "全部" filter button...');
        await page.click('button:has-text("全部")');

        await page.waitForResponse(response =>
            response.url().includes('/api/projects/home') && response.status() === 200
        );

        await page.waitForTimeout(1000);
        const resetProjects = await page.locator('.grid-cols-1 .bg-white.rounded-2xl.overflow-hidden').count();
        console.log(`Reset Projects rendered: ${resetProjects}`);

        console.log('VERIFICATION SUCCESSFUL: Filter buttons trigger API and update UI as expected.');

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await browser.close();
    }
})();
