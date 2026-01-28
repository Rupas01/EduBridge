const fs = require('fs');

// South Indian names
const firstNames = [
  'Arun', 'Karthik', 'Suresh', 'Pradeep', 'Ravi', 'Vignesh', 'Ajith', 'Anil', 'Naveen', 'Manoj',
  'Lakshmi', 'Divya', 'Anitha', 'Sowmya', 'Bhavani', 'Kavya', 'Revathi', 'Radha', 'Deepa', 'Meena'
];

const lastNames = [
  'Reddy', 'Naidu', 'Iyer', 'Iyengar', 'Pillai', 'Menon', 'Nair', 'Rao', 'Shetty', 'Varma'
];

function getRandomDate(start, end) {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

function getRandomMobileNumber() {
  return (Math.floor(Math.random() * 4000000000) + 6000000000).toString();
}

// Generate users
const dummyUsers = [];

for (let i = 0; i < 100; i++) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const username = `${firstName.toLowerCase()}${i}`;
  const email = `${username}@example.com`;
  const password = 'password123';
  const mobileNumber = getRandomMobileNumber();
  const dateOfBirth = `new Date('${getRandomDate(new Date(1985, 0, 1), new Date(2005, 0, 1))}')`;

  dummyUsers.push(`    {
        firstName: '${firstName}',
        lastName: '${lastName}',
        username: '${username}',
        email: '${email}',
        password: '${password}',
        mobileNumber: '${mobileNumber}',
        dateOfBirth: ${dateOfBirth}
    }`);
}

// Output to file or console
const output = `const dummyUsers = [\n${dummyUsers.join(',\n')}\n];\n\nmodule.exports = dummyUsers;`;

fs.writeFileSync('dummyUsers.js', output);
console.log('✅ dummyUsers.js created with 100 South Indian users.');