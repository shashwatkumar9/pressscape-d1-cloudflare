const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL
});

const sampleBlogPosts = [
    {
        title: 'The Complete Guide to Guest Posting in 2024',
        slug: 'complete-guide-guest-posting-2024',
        category: 'SEO Strategy',
        coverImage: '/uploads/blog/guest-posting-guide.png',
        excerpt: 'Learn everything you need to know about guest posting, from finding opportunities to measuring ROI. This comprehensive guide covers strategies, outreach techniques, and best practices for 2024.',
        metaTitle: 'Complete Guide to Guest Posting in 2024 | PressScape',
        metaDescription: 'Master guest posting with our comprehensive 2024 guide. Learn proven strategies for finding opportunities, crafting pitches, and measuring ROI. Perfect for SEO professionals and marketers.',
        keywords: 'guest posting, link building, SEO strategy, content marketing, backlinks',
        content: `
            <h2>What is Guest Posting?</h2>
            <p>Guest posting, also known as guest blogging, is the practice of writing and publishing an article on someone else's website or blog. It's one of the most effective strategies for building high-quality backlinks, increasing brand visibility, and establishing authority in your niche.</p>
            
            <h2>Why Guest Posting Still Works in 2024</h2>
            <p>Despite evolving SEO landscapes, guest posting remains a powerful strategy because:</p>
            <ul>
                <li><strong>Quality Backlinks:</strong> Earn natural, contextual links from authoritative websites</li>
                <li><strong>Targeted Traffic:</strong> Reach new audiences already interested in your niche</li>
                <li><strong>Brand Authority:</strong> Position yourself as an industry expert</li>
                <li><strong>Networking:</strong> Build relationships with other publishers and influencers</li>
            </ul>
            
            <h2>Finding Guest Post Opportunities</h2>
            <p>The first step is identifying websites that accept guest posts in your niche. Here are proven methods:</p>
            
            <h3>1. Google Search Operators</h3>
            <p>Use these search queries to find opportunities:</p>
            <ul>
                <li>"your niche" + "write for us"</li>
                <li>"your niche" + "guest post guidelines"</li>
                <li>"your niche" + "submit a guest post"</li>
                <li>"your niche" + "become a contributor"</li>
            </ul>
            
            <h3>2. Marketplace Platforms</h3>
            <p>Platforms like <strong>PressScape</strong> make it easy to discover verified websites accepting guest posts, with transparent pricing and quick turnaround times.</p>
            
            <h2>Crafting the Perfect Pitch</h2>
            <p>Your pitch email can make or break your guest posting success. Follow these guidelines:</p>
            <ol>
                <li><strong>Personalize each pitch:</strong> Reference specific articles from their blog</li>
                <li><strong>Propose specific topics:</strong> Don't ask "do you accept guest posts?"</li>
                <li><strong>Show your expertise:</strong> Include links to your best published work</li>
                <li><strong>Keep it concise:</strong> Busy editors appreciate brevity</li>
            </ol>
            
            <h2>Writing Guest Posts That Get Accepted</h2>
            <p>Once your pitch is accepted, delivering exceptional content is crucial:</p>
            
            <h3>Research the Audience</h3>
            <p>Read existing content on the blog to understand tone, style, and what resonates with readers.</p>
            
            <h3>Provide Unique Value</h3>
            <p>Don't republish existing content. Offer fresh insights, original data, or unique perspectives.</p>
            
            <h3>Follow Guidelines</h3>
            <p>Respect word counts, formatting requirements, and linking policies.</p>
            
            <h2>Measuring Guest Posting ROI</h2>
            <p>Track these metrics to evaluate your guest posting success:</p>
            <ul>
                <li>Referral traffic from published posts</li>
                <li>Domain authority of acquired backlinks</li>
                <li>Ranking improvements for target keywords</li>
                <li>Social shares and engagement</li>
                <li>New business opportunities or partnerships</li>
            </ul>
            
            <h2>Common Mistakes to Avoid</h2>
            <p>Learn from these frequent pitfalls:</p>
            <ul>
                <li><strong>Targeting low-quality sites:</strong> Focus on relevance and authority over quantity</li>
                <li><strong>Over-optimization:</strong> Use natural anchor text, not exact-match keywords</li>
                <li><strong>Neglecting relationships:</strong> Guest posting is about building connections, not just links</li>
                <li><strong>Ignoring analytics:</strong> Track performance to refine your strategy</li>
            </ul>
            
            <h2>Conclusion</h2>
            <p>Guest posting remains one of the most effective SEO and content marketing strategies in 2024. By following the guidelines in this guide, you can build quality backlinks, reach new audiences, and establish yourself as an authority in your industry.</p>
            
            <p>Ready to start your guest posting journey? <a href="/marketplace">Explore our marketplace</a> to find verified publishers accepting guest posts today.</p>
        `,
        tags: ['guest posting', 'SEO', 'link building', 'content marketing']
    },
    {
        title: 'How to Measure the ROI of Your Backlinks',
        slug: 'measure-roi-backlinks',
        category: 'Link Building',
        coverImage: '/uploads/blog/backlink-roi.png',
        excerpt: 'Track the real impact of your link building efforts with these metrics and tools. Learn how to calculate backlink ROI and optimize your strategy for maximum return.',
        metaTitle: 'How to Measure Backlink ROI: Complete Analytics Guide',
        metaDescription: 'Learn how to measure the ROI of your backlinks with proven metrics and tools. Calculate value, track performance, and optimize your link building strategy for better results.',
        keywords: 'backlink ROI, link building metrics, SEO analytics, backlink analysis, link value',
        content: `
            <h2>Why Measuring Backlink ROI Matters</h2>
            <p>Link building requires significant time and resources. Without proper ROI measurement, you're essentially flying blind—investing in strategies that may or may not deliver results.</p>
            
            <p>Understanding your backlink ROI helps you:</p>
            <ul>
                <li>Justify your SEO budget to stakeholders</li>
                <li>Identify which link building tactics work best</li>
                <li>Allocate resources more effectively</li>
                <li>Demonstrate the value of SEO to your organization</li>
            </ul>
            
            <h2>Key Metrics for Backlink ROI</h2>
            
            <h3>1. Organic Traffic Growth</h3>
            <p>The most direct indicator of backlink success is increased organic traffic. Use Google Analytics to track:</p>
            <ul>
                <li>Total organic sessions over time</li>
                <li>Traffic to specific pages with new backlinks</li>
                <li>New vs. returning visitor ratios</li>
            </ul>
            
            <h3>2. Keyword Rankings</h3>
            <p>Monitor ranking improvements for your target keywords. Tools like Ahrefs, SEMrush, or Moz can help track:</p>
            <ul>
                <li>Position changes for focus keywords</li>
                <li>Number of keywords in top 3, 10, and 20 positions</li>
                <li>Featured snippet acquisitions</li>
            </ul>
            
            <h3>3. Domain Authority Metrics</h3>
            <p>While not a direct Google ranking factor, DA/DR metrics indicate overall site health:</p>
            <ul>
                <li><strong>Domain Authority (Moz):</strong> 0-100 scale of site strength</li>
                <li><strong>Domain Rating (Ahrefs):</strong> Backlink profile strength</li>
                <li><strong>Trust Flow (Majestic):</strong> Link quality indicator</li>
            </ul>
            
            <h3>4. Referral Traffic</h3>
            <p>Direct traffic from backlinks shows immediate value beyond SEO:</p>
            <ul>
                <li>Sessions from referring domains</li>
                <li>Bounce rate of referral traffic</li>
                <li>Conversion rate from referrals</li>
            </ul>
            
            <h2>Calculating Backlink ROI</h2>
            
            <p>Here's a simple formula to calculate your backlink ROI:</p>
            
            <blockquote>
                <strong>ROI = (Value of Results - Cost of Link Building) / Cost of Link Building × 100%</strong>
            </blockquote>
            
            <h3>Example Calculation</h3>
            <p>Let's say you invested $2,000 in guest posting over 3 months:</p>
            <ul>
                <li>Organic traffic increased by 500 sessions/month</li>
                <li>Average session value: $5 (based on conversion rates)</li>
                <li>Monthly value: 500 × $5 = $2,500</li>
                <li>3-month value: $7,500</li>
            </ul>
            
            <p><strong>ROI = ($7,500 - $2,000) / $2,000 × 100% = 275%</strong></p>
            
            <h2>Tools for Tracking Backlink Performance</h2>
            
            <h3>1. Google Analytics</h3>
            <p>Essential for tracking traffic and conversions. Set up:</p>
            <ul>
                <li>Custom dashboards for organic traffic</li>
                <li>Goals for important conversions</li>
                <li>UTM parameters for specific campaigns</li>
            </ul>
            
            <h3>2. Google Search Console</h3>
            <p>Monitor search performance and discover new backlinks:</p>
            <ul>
                <li>Query performance over time</li>
                <li>Top performing pages</li>
                <li>Links to your site report</li>
            </ul>
            
            <h3>3. Backlink Analysis Tools</h3>
            <p>Professional SEO tools provide deeper insights:</p>
            <ul>
                <li><strong>Ahrefs:</strong> Comprehensive backlink database</li>
                <li><strong>SEMrush:</strong> Competitor analysis and backlink audits</li>
                <li><strong>Moz:</strong> Link quality metrics and spam detection</li>
            </ul>
            
            <h2>Advanced ROI Metrics</h2>
            
            <h3>Customer Lifetime Value (CLV)</h3>
            <p>For businesses with recurring revenue, calculate how backlink-driven customers contribute over time.</p>
            
            <h3>Brand Awareness</h3>
            <p>Measure brand search volume increases using Google Trends and Search Console.</p>
            
            <h3>Authority Score</h3>
            <p>Track your site's increasing authority in your niche through topical relevance and expert recognition.</p>
            
            <h2>Optimizing Your Link Building Strategy</h2>
            
            <p>Use your ROI data to refine your approach:</p>
            
            <ol>
                <li><strong>Double down on winners:</strong> Invest more in tactics showing positive ROI</li>
                <li><strong>Cut losers quickly:</strong> Abandon strategies that don't deliver results</li>
                <li><strong>Test systematically:</strong> Try new approaches in controlled experiments</li>
                <li><strong>Document everything:</strong> Build a knowledge base of what works</li>
            </ol>
            
            <h2>Common Pitfalls</h2>
            
            <ul>
                <li><strong>Expecting immediate results:</strong> SEO is a long-term investment; allow 3-6 months for impact</li>
                <li><strong>Ignoring link quality:</strong> One high-quality link beats ten mediocre ones</li>
                <li><strong>Failing to track attribution:</strong> Use proper tracking to know which links drive results</li>
                <li><strong>Over-focusing on vanity metrics:</strong> DA/DR are indicators, not goals</li>
            </ul>
            
            <h2>Conclusion</h2>
            
            <p>Measuring backlink ROI isn't just about justifying budgets—it's about optimizing your entire SEO strategy. By tracking the right metrics, calculating true ROI, and continuously refining your approach, you can build a link building program that delivers measurable business value.</p>
            
            <p>Start tracking your backlink performance today and make data-driven decisions that improve your SEO ROI.</p>
        `,
        tags: ['backlink analysis', 'SEO metrics', 'ROI tracking', 'link building', 'analytics']
    }
];

async function createSampleBlogs() {
    const client = await pool.connect();
    try {
        // Get admin user ID
        const adminResult = await client.query(
            "SELECT id FROM admin_users WHERE email = 'nanoo.shashwat@gmail.com'"
        );

        if (adminResult.rows.length === 0) {
            console.error('Admin user not found. Please create admin first.');
            return;
        }

        const adminId = adminResult.rows[0].id;
        console.log('✓ Found admin user:', adminId);

        for (const post of sampleBlogPosts) {
            console.log(`\nCreating blog post: "${post.title}"...`);

            const result = await client.query(
                `INSERT INTO blog_posts (
                    title, slug, content, excerpt, cover_image,
                    author_id, status, category, tags,
                    meta_title, meta_description, keywords,
                    published_at, created_at, updated_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW(), NOW())
                RETURNING id`,
                [
                    post.title,
                    post.slug,
                    post.content,
                    post.excerpt,
                    post.coverImage,
                    adminId,
                    'published',
                    post.category,
                    post.tags,
                    post.metaTitle,
                    post.metaDescription,
                    post.keywords
                ]
            );

            console.log(`✓ Created blog post with ID: ${result.rows[0].id}`);
        }

        console.log('\n✅ Successfully created all sample blog posts!');
        console.log('\nView them at: http://localhost:3003/blog');
        console.log('Admin panel: http://localhost:3003/admin/blog\n');

    } catch (error) {
        console.error('Error creating sample blogs:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

createSampleBlogs();
