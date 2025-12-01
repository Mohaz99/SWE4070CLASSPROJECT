const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

const runTests = async () => {
    try {
        console.log('Starting Admin Integration Tests...');

        // 1. Login
        console.log('1. Logging in as Admin...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'Passw0rd!' })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status} ${loginRes.statusText}`);
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('✓ Login successful. Token received.');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // 2. Get Users
        console.log('2. Fetching Users...');
        const usersRes = await fetch(`${BASE_URL}/admin/users`, { headers });
        if (!usersRes.ok) throw new Error(`Get Users failed: ${usersRes.status}`);
        const usersData = await usersRes.json();
        console.log(`✓ Users fetched: ${usersData.data.length} users found.`);

        // 3. Create User
        console.log('3. Creating Test User...');
        const testUser = { name: 'Test User', email: `test${Date.now()}@example.com`, role: 'student' };
        const createRes = await fetch(`${BASE_URL}/admin/users`, {
            method: 'POST',
            headers,
            body: JSON.stringify(testUser)
        });
        if (!createRes.ok) throw new Error(`Create User failed: ${createRes.status}`);
        const createData = await createRes.json();
        const newUserId = createData.data._id || createData.data.id;
        console.log(`✓ User created: ${newUserId}`);

        // 4. Update User
        console.log('4. Updating Test User...');
        const updateRes = await fetch(`${BASE_URL}/admin/users/${newUserId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ fullName: 'Updated Test User', email: testUser.email, role: 'student' })
        });
        if (!updateRes.ok) throw new Error(`Update User failed: ${updateRes.status}`);
        console.log('✓ User updated.');

        // 5. Get Marks
        console.log('5. Fetching Marks...');
        const marksRes = await fetch(`${BASE_URL}/admin/marks`, { headers });
        if (!marksRes.ok) throw new Error(`Get Marks failed: ${marksRes.status}`);
        const marksData = await marksRes.json();
        console.log(`✓ Marks fetched: ${marksData.data.length} records.`);

        // 6. Get Issues
        console.log('6. Fetching Issues...');
        const issuesRes = await fetch(`${BASE_URL}/admin/issues`, { headers });
        if (!issuesRes.ok) throw new Error(`Get Issues failed: ${issuesRes.status}`);
        const issuesData = await issuesRes.json();
        console.log(`✓ Issues fetched: ${issuesData.data.length} issues.`);

        // 7. Delete User
        console.log('7. Deleting Test User...');
        const deleteRes = await fetch(`${BASE_URL}/admin/users/${newUserId}`, {
            method: 'DELETE',
            headers
        });
        if (!deleteRes.ok) throw new Error(`Delete User failed: ${deleteRes.status}`);
        console.log('✓ User deleted.');

        console.log('\nALL TESTS PASSED!');

    } catch (error) {
        console.error('\nTEST FAILED:', error.message);
    }
};

runTests();
