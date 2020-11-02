(function(){
    
    const copyrightYear = document.querySelector('#js-copyright-year');
    const date = new Date()
    const year = date.getFullYear() 

    copyrightYear.textContent = year;
})()
