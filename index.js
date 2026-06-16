#!/usr/bin/env node

const https = require('https');
const querystring = require('querystring');

const API = 'score.get-scala.com';
const VERSION = '1.0.0';

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

const c = process.stdout.isTTY ? COLORS : Object.fromEntries(Object.keys(COLORS).map(k => [k, '']));

function fetch(path) {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: API,
      path,
      headers: { 'User-Agent': `company-cli/${VERSION}` },
      timeout: 10000,
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Invalid response')); }
      });
    }).on('error', reject).on('timeout', function() { this.destroy(); reject(new Error('Timeout')); });
  });
}

function fmt(n) {
  if (n == null || n === '' || isNaN(n)) return c.dim + 'n/a' + c.reset;
  const num = Number(n);
  if (num >= 1e9) return `€${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `€${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `€${(num / 1e3).toFixed(0)}K`;
  return `€${num.toFixed(0)}`;
}

function scoreBar(score) {
  if (score == null || isNaN(score)) return c.dim + 'n/a' + c.reset;
  const s = Number(score);
  const filled = Math.round(s / 5);
  const empty = 20 - filled;
  const color = s >= 70 ? c.green : s >= 40 ? c.yellow : c.red;
  return color + '█'.repeat(filled) + c.dim + '░'.repeat(empty) + c.reset + ` ${s}/100`;
}

function printCompany(company) {
  const name = company.name || company.company_name || 'Unknown';
  const country = company.country || company.country_code || '';
  const city = company.city || '';
  const status = company.status || '';
  const revenue = company.revenue || company.estimated_revenue;
  const employees = company.employees || company.employee_count;
  const score = company.health_score || company.score;
  const nace = company.nace_description || company.nace_code || '';
  const legal = company.legal_form || '';
  const vat = company.vat_number || company.tax_id || '';
  const founded = company.founded || company.incorporation_date || '';
  const website = company.website || '';
  const phone = company.phone || '';
  const email = company.email || '';

  console.log();
  console.log(`  ${c.bold}${c.white}${name}${c.reset}`);
  console.log(`  ${c.gray}${'─'.repeat(Math.min(name.length + 4, 60))}${c.reset}`);

  const location = [city, country].filter(Boolean).join(', ');
  if (location) console.log(`  ${c.cyan}📍${c.reset} ${location}`);
  if (nace) console.log(`  ${c.cyan}🏭${c.reset} ${nace}`);
  if (legal) console.log(`  ${c.cyan}📋${c.reset} ${legal}`);
  if (status) {
    const statusColor = status.toLowerCase() === 'active' ? c.green : c.red;
    console.log(`  ${c.cyan}📊${c.reset} ${statusColor}${status}${c.reset}`);
  }

  console.log();
  if (revenue != null) console.log(`  ${c.bold}Revenue${c.reset}     ${fmt(revenue)}`);
  if (employees != null) console.log(`  ${c.bold}Employees${c.reset}   ${Number(employees).toLocaleString()}`);
  if (score != null) console.log(`  ${c.bold}Health${c.reset}      ${scoreBar(score)}`);

  if (founded || vat) {
    console.log();
    if (founded) console.log(`  ${c.dim}Founded:${c.reset}  ${founded}`);
    if (vat) console.log(`  ${c.dim}VAT:${c.reset}      ${vat}`);
  }

  if (website || phone || email) {
    console.log();
    if (website) console.log(`  ${c.dim}Web:${c.reset}      ${c.blue}${website}${c.reset}`);
    if (phone) console.log(`  ${c.dim}Phone:${c.reset}    ${phone}`);
    if (email) console.log(`  ${c.dim}Email:${c.reset}    ${email}`);
  }

  console.log();
}

function printHelp() {
  console.log(`
  ${c.bold}company${c.reset} — look up any company in the terminal

  ${c.bold}Usage:${c.reset}
    company <name>              Search by company name
    company <name> --country DE Filter by country (ISO code)
    company <vat>               Look up by VAT number

  ${c.bold}Examples:${c.reset}
    company Ferrero
    company "Siemens AG" --country DE
    company IT02727330014

  ${c.bold}Options:${c.reset}
    --country, -c  ISO country code (IT, DE, FR, US, GB, ...)
    --json         Output raw JSON
    --help, -h     Show this help
    --version, -v  Show version

  ${c.dim}Data: 250M+ companies from 50+ countries${c.reset}
  ${c.dim}Free: 50 lookups/month, no signup${c.reset}
  ${c.dim}More: https://github.com/Alessandro114/company-lookup-cli${c.reset}
`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }
  if (args.includes('--version') || args.includes('-v')) {
    console.log(VERSION);
    process.exit(0);
  }

  let country = null;
  let jsonOutput = false;
  const queryParts = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--country' || args[i] === '-c') {
      country = args[++i];
    } else if (args[i] === '--json') {
      jsonOutput = true;
    } else if (!args[i].startsWith('-')) {
      queryParts.push(args[i]);
    }
  }

  const query = queryParts.join(' ');
  if (!query) {
    console.error('  Error: provide a company name or VAT number');
    process.exit(1);
  }

  const params = { q: query, limit: '5', format: 'json' };
  if (country) params.country = country;

  try {
    const data = await fetch(`/api/search?${querystring.stringify(params)}`);
    const results = data.results || data.companies || data.data || [];

    if (jsonOutput) {
      console.log(JSON.stringify(results, null, 2));
      process.exit(0);
    }

    if (results.length === 0) {
      console.log(`\n  ${c.dim}No results for "${query}"${c.reset}\n`);
      process.exit(0);
    }

    if (results.length === 1 || queryParts.length > 2) {
      printCompany(results[0]);
    } else {
      console.log(`\n  ${c.dim}Found ${data.total || results.length} results for "${query}"${c.reset}\n`);
      results.forEach((r, i) => {
        const name = r.name || r.company_name || 'Unknown';
        const country = r.country || r.country_code || '';
        const revenue = r.revenue || r.estimated_revenue;
        const employees = r.employees || r.employee_count;
        const score = r.health_score || r.score;
        console.log(`  ${c.bold}${i + 1}.${c.reset} ${c.white}${name}${c.reset} ${c.dim}(${country})${c.reset}`);
        const details = [];
        if (revenue) details.push(`Revenue: ${fmt(revenue)}`);
        if (employees) details.push(`Employees: ${Number(employees).toLocaleString()}`);
        if (score) details.push(`Score: ${score}/100`);
        if (details.length) console.log(`     ${c.dim}${details.join(' | ')}${c.reset}`);
      });
      console.log(`\n  ${c.dim}Tip: be more specific for a detailed view${c.reset}\n`);
    }
  } catch (err) {
    console.error(`  ${c.red}Error: ${err.message}${c.reset}`);
    process.exit(1);
  }
}

main();
