import { prisma } from '@/lib/db';

async function seed() {
  console.log('🌱 Seeding database...');

  const existingSources = await prisma.source.count();
  if (existingSources > 0) {
    console.log('Database already seeded, skipping.');
    return;
  }

  const okcInfrastructureSource = await prisma.source.create({
    data: {
      name: 'OKC Infrastructure Project Updates',
      organization: 'City of Oklahoma City',
      canonicalUrl: 'https://www.okc.gov/Infrastructure-Development/Infrastructure-Project-Updates',
      adapterType: 'HTML_SCRAPER',
      config: {
        url: 'https://www.okc.gov/Infrastructure-Development/Infrastructure-Project-Updates',
        selectors: {
          projectCard: '.project-card, .project-item, article, .card, [class*="project"], .views-row',
          title: 'h3, h2, .title, [class*="title"]',
          summary: '.description, .summary, p, [class*="description"]',
          status: '.status, [class*="status"]',
          location: '.location, [class*="location"]',
          link: 'a',
        },
        fieldMapping: {},
      },
      enabled: true,
    },
  });

  const visionOkcSource = await prisma.source.create({
    data: {
      name: 'Vision OKC Projects',
      organization: 'City of Oklahoma City',
      canonicalUrl: 'https://vision.okc.gov/projects',
      adapterType: 'ARCGIS_FEATURE_SERVER',
      config: {
        url: 'https://maps.okc.gov/arcgis/rest/services/VisionOKC/Projects/FeatureServer/0',
        fieldMapping: {
          externalId: 'OBJECTID',
          title: 'PROJECT_NAME',
          summary: 'DESCRIPTION',
          status: 'STATUS',
          location: 'LOCATION',
          address: 'ADDRESS',
          projectType: 'PROJECT_TYPE',
          fundingAmount: 'TOTAL_COST',
          fundingSource: 'FUNDING_SOURCE',
          startDate: 'START_DATE',
          estimatedEndDate: 'EST_COMPLETION',
        },
        pagination: {
          type: 'offset',
          param: 'resultOffset',
          limit: 1000,
        },
      },
      enabled: true,
    },
  });

  const okcOpenDataSource = await prisma.source.create({
    data: {
      name: 'OKC Open Data Portal - Capital Projects',
      organization: 'City of Oklahoma City',
      canonicalUrl: 'https://data.okc.gov',
      adapterType: 'JSON_API',
      config: {
        url: 'https://data.okc.gov/api/views/capital-projects/rows.json',
        fieldMapping: {
          externalId: 'project_id',
          title: 'project_name',
          summary: 'description',
          status: 'status',
          location: 'location',
          projectType: 'category',
          fundingAmount: 'budget',
          fundingSource: 'funding_source',
          startDate: 'start_date',
          estimatedEndDate: 'estimated_completion',
        },
      },
      enabled: false,
    },
  });

  console.log('✅ Created sources:', { okcInfrastructureSource, visionOkcSource, okcOpenDataSource });

  console.log('🌱 Seeding complete!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });