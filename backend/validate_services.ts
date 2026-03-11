
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function testServiceManagement() {
  console.log('🚀 Starting Automated Validation for Service Management...');
  
  try {
    // 1. Login as Admin
    console.log('\n🔐 Logging in as Admin...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };
    console.log('✅ Logged in successfully.');

    // 2. Test GET Service Types
    console.log('\n📋 Fetching Service Types...');
    const servicesRes = await axios.get(`${API_URL}/service-types`, authHeader);
    console.log(`✅ Found ${servicesRes.data.length} service types.`);
    const serviceTypes = servicesRes.data;

    // 3. Test Create a New Service Type
    const uniqueName = `Validation Test ${Date.now()}`;
    console.log(`\n➕ Creating a new Service Type: "${uniqueName}"...`);
    const newServiceRes = await axios.post(`${API_URL}/service-types`, {
      name: uniqueName,
      description: 'Servicio creado por validación automática'
    }, authHeader);
    const testServiceId = newServiceRes.data.id;
    console.log(`✅ Service created with ID: ${testServiceId}`);

    // 4. Test GET Service Mappings
    console.log('\n🗺️ Fetching Service Mappings...');
    const mappingsRes = await axios.get(`${API_URL}/service-mappings`, authHeader);
    console.log(`✅ Found ${mappingsRes.data.length} service mappings.`);

    // 5. Test Configure a Mapping
    // Get a vendor and an equipment type to create a mapping
    const vendorsRes = await axios.get(`${API_URL}/vendors`, authHeader);
    const equipmentTypesRes = await axios.get(`${API_URL}/types`, authHeader);
    
    if (vendorsRes.data.length > 0 && equipmentTypesRes.data.length > 0) {
      const vendorId = vendorsRes.data[0].id;
      const equipmentTypeId = equipmentTypesRes.data[0].id;
      
      console.log(`\n⚙️ Configuring mapping for Vendor: ${vendorsRes.data[0].name} and Equipment Type: ${equipmentTypesRes.data[0].name}...`);
      
      const targetServices = [testServiceId];
      if (serviceTypes.length > 0) targetServices.push(serviceTypes[0].id);
      
      await axios.post(`${API_URL}/service-mappings/set-services`, {
        vendorId,
        equipmentTypeId,
        serviceTypeIds: targetServices
      }, authHeader);
      
      console.log('✅ Mapping updated successfully.');
      
      const verifyMapRes = await axios.get(`${API_URL}/service-mappings`, authHeader);
      const hasMap = verifyMapRes.data.some((m: any) => 
        m.vendorId === vendorId && 
        m.equipmentTypeId === equipmentTypeId && 
        m.serviceTypeId === testServiceId
      );
      
      if (hasMap) {
        console.log('✅ Integration check passed: New service mapping found in retrieval.');
      } else {
        throw new Error('❌ Integration check failed: New service mapping not found.');
      }

      // Cleanup Mapping
      console.log('\n🧹 Cleaning up test mapping...');
      const originalServiceIds = serviceTypes
        .filter((s: any) => verifyMapRes.data.some((m: any) => m.vendorId === vendorId && m.equipmentTypeId === equipmentTypeId && m.serviceTypeId === s.id && s.id !== testServiceId))
        .map((s: any) => s.id);
      
      await axios.post(`${API_URL}/service-mappings/set-services`, {
        vendorId,
        equipmentTypeId,
        serviceTypeIds: originalServiceIds
      }, authHeader);
      console.log('✅ Mapping restored to original state.');
    }

    // 6. Test Cleanup (Delete Test Service)
    console.log('\n🧹 Cleaning up test service...');
    await axios.delete(`${API_URL}/service-types/${testServiceId}`, authHeader);
    console.log('✅ Test service deleted.');

    console.log('\n✨ AUTOMATED VALIDATION COMPLETED SUCCESSFULLY! ✨');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ VALIDATION FAILED!');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

testServiceManagement();
