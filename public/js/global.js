const categories = {
    F : { name: 'Food', icon: '<i class="fas fa-utensils"></i>'},
    T : {name: 'Traffic', icon: '<i class="fas fa-subway"></i>'},
    C : {name: 'Cloth', icon: '<i class="fas fa-tshirt"></i>'},
    CO :{name: 'Cosmetic', icon: '<i class="fa fa-bath "></i>'},
    S : {name: 'Social', icon: '<i class="fas fa-users"></i>'},
    M : {name: 'Medical', icon: '<i class="fas fa-briefcase-medical"></i>'},
    E : {name: 'Entertain', icon:'<i class="fas fa-shopping-basket"></i>'},
    U : {name: 'Utility', icon: '<i class="fas fa-plug"></i>'},
    TV : {name: 'Travel', icon: '<i class="fas fa-plane-departure"></i>'},
    ED : {name: 'Educate', icon:'<i class="fas fa-book-open"></i>'},
    EQ : {name: 'Equipment', icon:'<i class="fa fa-cart-plus"></i>'},
    MA : {name: 'Mainte.', icon: '<i class="fas fa-wrench"></i>'},
    ME : {name:'Merit', icon:'<i class="fas fa-pray"></i>'},
    IN : {name:'Insurance', icon:'<i class="fa fa-medkit"></i>'},
    O : {name: 'Other', icon:'<i class="fab fa-rocketchat"></i>'},
    R : {name: 'Revenue', icon:'<i class="fas fa-money-bill"></i>'}      
    // D : Reserverd for modify date
  };

const tags = {
  cash : { name: 'CASH', icon: '<i class="fas fa-money-bill"></i>'},
  // 9596 : { name: 'KBANK', icon: '<i class="fas fa-credit-card"></i>'},
  // 2468 : { name: '2468', icon: '<i class="fas fa-credit-card"></i>'},
  // 6861 : { name: '6861', icon: '<i class="fas fa-credit-card"></i>'}
}
function formatDate(date) {
  if (date){
    var d = new Date(date);
  }
  else{
    var d = new Date();
  }
  
  var  month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month ,day].join('/');
}
function numberWithCommas(x) {
  return x.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}