#!/usr/bin/env node

const https = require('https');
const http = require('http');
const dns = require('dns');
const { execSync } = require('child_process');

const DOMAIN = 'oemalta.shop';
const TARGET_URL = `https://${DOMAIN}`;

console.log('🔍 XNEMA Domain Diagnostic Tool');
console.log('================================');
console.log(`Checking domain: ${DOMAIN}\n`);

// Test 1: DNS Resolution
console.log('1. 📡 DNS Resolution Test...');
try {
  dns.lookup(DOMAIN, (err, address, family) => {
    if (err) {
      console.log('❌ DNS Resolution FAILED:', err.message);
      console.log('   → Check if domain is registered and DNS is configured\n');
    } else {
      console.log(`✅ DNS Resolution OK: ${address} (IPv${family})\n`);
    }
  });
} catch (error) {
  console.log('❌ DNS Test Error:', error.message);
}

// Test 2: HTTP Connectivity
console.log('2. 🌐 HTTP Connectivity Test...');
const httpReq = http.request({
  hostname: DOMAIN,
  port: 80,
  path: '/',
  method: 'GET',
  timeout: 5000
}, (res) => {
  console.log(`✅ HTTP Response: ${res.statusCode} ${res.statusMessage}`);
  if (res.statusCode >= 300 && res.statusCode < 400) {
    console.log(`   → Redirect to: ${res.headers.location}`);
  }
  console.log('');
});

httpReq.on('error', (err) => {
  console.log('❌ HTTP Connection FAILED:', err.message);
  console.log('   → Check if server is running and accessible\n');
});

httpReq.on('timeout', () => {
  console.log('❌ HTTP Connection TIMEOUT');
  console.log('   → Server may be down or DNS not resolved\n');
});

httpReq.end();

// Test 3: HTTPS/SSL Test
console.log('3. 🔒 HTTPS/SSL Test...');
const httpsReq = https.request({
  hostname: DOMAIN,
  port: 443,
  path: '/',
  method: 'GET',
  timeout: 5000
}, (res) => {
  console.log(`✅ HTTPS Response: ${res.statusCode} ${res.statusMessage}`);
  console.log(`   → SSL Certificate: OK`);
  if (res.statusCode >= 300 && res.statusCode < 400) {
    console.log(`   → Redirect to: ${res.headers.location}`);
  }
  console.log('');
});

httpsReq.on('error', (err) => {
  console.log('❌ HTTPS Connection FAILED:', err.message);
  if (err.code === 'CERT_HAS_EXPIRED') {
    console.log('   → SSL Certificate has expired');
  } else if (err.code === 'ENOTFOUND') {
    console.log('   → Domain not found - check DNS configuration');
  } else if (err.code === 'ECONNREFUSED') {
    console.log('   → Connection refused - check server configuration');
  }
  console.log('');
});

httpsReq.on('timeout', () => {
  console.log('❌ HTTPS Connection TIMEOUT');
  console.log('   → Server may be down or SSL not configured\n');
});

httpsReq.end();

// Test 4: DNS Propagation Check
console.log('4. 🌍 DNS Propagation Check...');
const dnsServers = [
  '8.8.8.8',      // Google
  '1.1.1.1',      // Cloudflare
  '208.67.222.222', // OpenDNS
  '9.9.9.9'       // Quad9
];

dnsServers.forEach((server, index) => {
  setTimeout(() => {
    try {
      const result = execSync(`nslookup ${DOMAIN} ${server}`, { encoding: 'utf8', timeout: 3000 });
      if (result.includes('Name:') || result.includes('Address:')) {
        console.log(`✅ DNS Server ${server}: Resolved`);
      } else {
        console.log(`❌ DNS Server ${server}: Not resolved`);
      }
    } catch (error) {
      console.log(`❌ DNS Server ${server}: Error - ${error.message.split('\n')[0]}`);
    }
    
    if (index === dnsServers.length - 1) {
      console.log('');
      showRecommendations();
    }
  }, index * 500);
});

function showRecommendations() {
  console.log('📋 RECOMMENDATIONS:');
  console.log('==================');
  console.log('');
  
  console.log('If DNS is not resolving:');
  console.log('• Check domain registration status');
  console.log('• Verify DNS records are configured correctly');
  console.log('• Wait for DNS propagation (up to 48 hours)');
  console.log('• Contact domain registrar support');
  console.log('');
  
  console.log('If HTTP/HTTPS is failing:');
  console.log('• Verify deployment is successful');
  console.log('• Check hosting provider configuration');
  console.log('• Ensure domain is added to hosting platform');
  console.log('• Check SSL certificate status');
  console.log('');
  
  console.log('Quick fixes to try:');
  console.log('• Clear browser cache and DNS cache');
  console.log('• Try accessing from different network');
  console.log('• Use incognito/private browsing mode');
  console.log('• Check from different device/location');
  console.log('');
  
  console.log('Alternative access methods:');
  console.log('• Dev server: https://8823c34e67354cae9c514d254340cb6d-78f9b6feeb114a6cab838aaa0.fly.dev/');
  console.log('• Vercel deploy: Check vercel dashboard for .vercel.app URL');
  console.log('• Netlify deploy: Check netlify dashboard for .netlify.app URL');
  console.log('');
  
  console.log('💡 For immediate access, use the dev server URL above');
  console.log('📞 Support: cinexnema@gmail.com | (15) 99763-6161');
}

// Cleanup and exit after tests
setTimeout(() => {
  console.log('\n🏁 Diagnostic complete. Check results above for next steps.');
  process.exit(0);
}, 5000);
