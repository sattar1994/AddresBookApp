const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const strRegex = /^[a-zA-Z\s]*$/;
const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
const digitregex = /^\d+$/;

const countryList = document.getElementById('country-list');
const fullScreenDiv = document.getElementById('fullscreen-div');
const modal = document.getElementById('modal');
const addBtn = document.getElementById('add-btn');
const closeBtn = document.getElementById('close-btn');
const modalBtns = document.getElementById('modal-btns');
const form = document.getElementById('modal');
const addrBookList = document.querySelector('#addr-book-list tbody');
let addrName = firstName = lastName = email = phone = streetAddr = postCode = city = country = labels = '';

class UI{
    static showAddressList(){
        const addresses = Address.getAddresses();
        addresses.forEach(address => {UI.addToAddressList(address)}) 
    }
    static addToAddressList(address){
        const tableRow = document.createElement('tr');
        tableRow.setAttribute('data-id', address.id);
        tableRow.innerHTML = `
        <td>${address.id}</td>
        <td>
            <span class="addressing-name">
              ${address.addrName}
            </span><br><span class="address">${address.streetAddr} ${address.postCode} ${address.city} ${address.country}</span>
        </td>
        <td><span>${address.labels}</span></td>
        <td>${address.firstName + ' ' + address.lastName}</td>
        <td>${address.phone}</td>
        `;
        addrBookList.appendChild(tableRow)
    }
    static showModalData(id){
        const addresses = Address.getAddresses();
        addresses.forEach(address => {
            if(address.id == id){
                form.addr_ing_name.value = address.addrName;
                form.first_name.value = address.firstName;
                form.last_name.value = address.lastName;
                form.email.value = address.email;
                form.phone.value = address.phone;
                form.street_addr.value = form.streetAddr;
                form.postal_code.value = form.postCode;
                form.city.value = form.city;
                form.country.value = form.country;
                form.labels.value = form.value;
                document.getElementById('modal-title').innerHTML = "change Address Detail";
                document.getElementById('modal-btns').innerHTML = `<button type='submit' id='update-btn' data-id='${id}'>Update</button>
                <button type='button' id='delete-btn' data-id='${id}'>Delete </button>`
            }

        })
    }
    static showModal(){
        modal.style.display='block';
        fullScreenDiv.style.display='block'
    }
    static closeModal(){
        modal.style.display='none';
        fullScreenDiv.style.display='none'

    }
}
class Address{
    constructor(id, addrName ,firstName ,lastName  ,email  ,phone  ,streetAddr  ,postCode  ,city  ,country  ,labels){
        this.id = id,
        this.addrName = addrName,
        this.firstName = firstName,
        this.lastName = lastName,
        this.email = email,
        this.phone = phone,
        this.streetAddr = streetAddr,
        this.postCode = postCode, 
        this.city = city,
        this.country  =country,
        this.labels = labels
    }
    static getAddresses(){
        let addresses;
        if(localStorage.getItem('addresses') == null){
            addresses = []
        }else{
            addresses = JSON.parse(localStorage.getItem('addresses'));
        }
        return addresses
    }
    static addAddress(address){
       const addresses = Address.getAddresses();
       addresses.push(address);
       localStorage.setItem('addresses', JSON.stringify(addresses))
    }
    static deleteAddress(id){
        const addresses = Address.getAddresses();
        addresses.forEach((address, index)=>{
            if(address.id == id){
                addresses.splice(index, 1)
            }
        });
        localStorage.setItem('addresses', JSON.stringify(addresses));
        form.reset();
        UI.closeModal();
        addrBookList.innerHTML = '';
        UI.showAddressList()
    };
    static updateAddress(item){
         const addresses = Address.getAddresses();
         addresses.forEach(address => {
            if(address.id == item.id){
                address.addrName = item.addrName;
                address.firstName = item.firstName;
                address.lastName = item.lastName;
                address.email = item.email;
                address.phone = item.phone;
                address.postCode = item.postCode;
                address.streetAddr = item.streetAddr;
                address.city = item.city;
                address.country = item.country;
                address.labels = item.labels
            }
         });
         localStorage.setItem('addresses', JSON.stringify(addresses));
         addrBookList.innerHTML = '';
         UI.showAddressList();
    }
}
window.addEventListener('DOMContentLoaded', function(){
    loadJSON();
    eventListeners();
    UI.showAddressList()
});
function loadJSON(){
    fetch('countries.json')
    .then(response => response.json())
    .then(data => {
        let html = '';
        data.forEach(country => {
            html += `
            <option>${country.name}</option>
            `
        });
        countryList.innerHTML = html
    })
}
function eventListeners(){
    addBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('modal-title').innerHTML = 'Add Address';
        UI.showModal();
        document.getElementById('modal-btns').innerHTML = `
        <button type='submit' id='save-btn'>Save</button>
        `;
    });
    closeBtn.addEventListener('click', UI.closeModal);
    modalBtns.addEventListener('click', (e)=>{
        e.preventDefault();
        if(e.target.id == 'save-btn'){
            let isFormValid = getFormData();
            if(!isFormValid){
                form.querySelectorAll('input').forEach(input=>{
                    setTimeout(()=>{
                        input.classList.remove('errorMsg')
                    }, 1500)
                })
            }else{
                let allItem = Address.getAddresses();
                let lastItemId = (allItem.length > 0) ? allItem[allItem.length - 1].id : 0;
                lastItemId++;
                const addressItem = new Address(lastItemId,addrName ,firstName ,lastName  ,email  ,phone  ,streetAddr  ,postCode  ,city  ,country  ,labels);
                Address.addAddress(addressItem);
                UI.closeModal();
                UI.addToAddressList(addressItem);
                form.reset()
            }
        }
    });
    addrBookList.addEventListener('click', (e)=>{
       UI.showModal();
       let trElement;
       if(e.target.parentElement.tagName == 'TD'){
        trElement = e.target.parentElement.parentElement
       }
       if(e.target.parentElement.tagName == 'TR'){
        trElement = e.target.parentElement;
       }
       let viewID = trElement.dataset.id;
       UI.showModalData(viewID) 
    });
    modalBtns.addEventListener('click', (e)=>{
        if(e.target.id == 'delete-btn'){
            Address.deleteAddress(e.target.dataset.id)
        }
    });
    modalBtns.addEventListener('click', (e)=>{
        e.preventDefault();
        if(e.target.id == 'update-btn'){
            let id = e.target.dataset.id;
            let isFormValid = getFormData();
            if(!isFormValid){
                form.querySelectorAll('input').forEach(input => {
                    setTimeout(()=>{
                        input.classList.remove('errorMsg')
                    },1500)
                })
            }else{
                const addressItem = new Address(id,addrName,firstName,lastName,email,phone,streetAddr,postCode,city,country,labels);
                Address.updateAddress(addressItem);
                UI.closeModal();
                form.reset()
            }
        }
    })
};
function getFormData(){
    let inputValidStatus = [];
    
    if(!strRegex.test(form.addr_ing_name.value) || form.addr_ing_name.value.trim().length == 0 ){
        addErrorMsg(form.addr_ing_name);
        inputValidStatus[0] = false;
    }else{
        addrName = form.addr_ing_name.value;
        inputValidStatus[0] =true
    }

    if(!strRegex.test(form.first_name.value) || form.first_name.value.trim().length == 0 ){
    addErrorMsg(form.first_name);
        inputValidStatus[1] = false;
    }else{
        firstName = form.first_name.value;
        inputValidStatus[1] =true
    }

    if(!strRegex.test(form.last_name.value) || form.last_name.value.trim().length == 0 ){
    addErrorMsg(form.last_name);
        inputValidStatus[2] = false;
    }else{
        lastName = form.last_name.value;
        inputValidStatus[2] =true
    }

    if(!emailRegex.test(form.email.value)){
    addErrorMsg(form.email);
        inputValidStatus[3] = false;
    }else{
        email = form.email.value;
        inputValidStatus[3] =true
    }

    if(!phoneRegex.test(form.phone.value)){
    addErrorMsg(form.phone);
        inputValidStatus[4] = false;
    }else{
        phone = form.phone.value;
        inputValidStatus[4] =true
    }

    if(!(form.street_addr.value.trim().length > 0)){
    addErrorMsg(form.street_addr);
        inputValidStatus[5] = false;
    }else{
        streetAddr = form.street_addr.value;
        inputValidStatus[5] =true
    }

    if(!digitregex.test(form.postal_code.value)){
    addErrorMsg(form.postal_code);
        inputValidStatus[6] = false;
    }else{
        postCode = form.postal_code.value;
        inputValidStatus[6] =true
    }

    if(!strRegex.test(form.city.value) || form.city.value.trim().length == 0){
        addErrorMsg(form.city);
        inputValidStatus[7] = false
    }else{
        city = form.city.value;
        inputValidStatus[7] = true
    }
    country = form.country.value;
    labels = form.labels.value;
    return inputValidStatus.includes(false) ? false : true;
};
function addErrorMsg(inputBox){
    inputBox.classList.add('errorMsg')
}