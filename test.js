function generateDivisionCode(divisionName) {
    // Convert division name to lowercase and remove any spaces or special characters
    const cleanedDivisionName = divisionName.toUpperCase().replace(/\s/g, '');
  
    // Generate division code by taking the first three letters of the cleaned division name
    const divisionCode = cleanedDivisionName.substring(0, 3);
  
    return divisionCode;
}
const divisionName = 'Sales Division';
const divisionCode = generateDivisionCode(divisionName);
console.log('Division Code:', divisionCode);
function generateDepartmentCode(departmentName, divisionName) {
    // Convert department and division names to lowercase and remove any spaces or special characters
    const cleanedDepartmentName = departmentName.toUpperCase().replace(/\s/g, '');
    const cleanedDivisionName = divisionName.toUpperCase().replace(/\s/g, '');
  
    // Generate department code by concatenating the cleaned names with an underscore
    const departmentCode = cleanedDivisionName.substring(0, 3) + '_' + cleanedDepartmentName.substring(0, 3);
  
    return departmentCode;
  }
  const departmentName = 'Finance Department';
  const departmentCode = generateDepartmentCode(departmentName, divisionName);
  console.log('Department Code:', departmentCode);
    