//Creo variables 
const futureForcastSection = document.getElementById("future-forcast-section");
const currentSelectedCity = document.getElementsByClassName("current-selected-city");
const cityList = document.querySelector(".city-section");
var clearButton = $(".fa-trash").on("click",clearHistory);


const currentTime = moment().format("MMMM Do YYYY, H:mm");
const timeDisplay = $("<div>");
timeDisplay.text(currentTime);
$(".date-and-time").append(timeDisplay);

//obtengo informacion del local
//Creo array vacio, coloco por defecto Rosario cuando se abre la app
let storedCity = JSON.parse(localStorage.getItem("storedCity"));
if (storedCity !== null) {
    cityArray = storedCity;
} else {
    cityArray = [];
    cityArray[0] = "Rosario";
}

let lastCityEntered = cityArray[cityArray.length - 1];

renderCities();
displayCurrentForecast();
//Funcion para renderizar las ciudades
function renderCities() {
    cityList.innerHTML = "";
    for (i = 0; i < cityArray.length; i++) {
        let cityli = document.createElement("li");
        cityli.innerHTML = cityArray[i];
        cityList.appendChild(cityli);
    }
//Creo funcion cuando se hace click en la barra lateral
$("li").on("click", function (event) {
    reset();
    event.preventDefault();
    lastCityEntered = $(this).text();
    displayCurrentForecast();
})
}

//Se invoca a preventDefault

$(".fa-search").on("click", function (event) {
    event.preventDefault();
    let cityEntered = $("input.input-section").val();

    if (cityEntered === "") {
        return;
    }

    for (i = 0; i < cityArray.length; i++) {
        if (cityEntered === cityArray[i]) {
            return;
        }
    }
   //pushea nueva ciudad en el array cityArray
//localStorage almacena storedCity en el almacenamiento local
//JSON.stringify convierte el objeto cityArray en una cadena de texto
    cityArray.push(cityEntered);
    localStorage.setItem("storedCity", JSON.stringify(cityArray));
    
//A lastCityEntered se le asigna cityEntered
    lastCityEntered = cityEntered;
    renderCities();
    displayCurrentForecast();
    reset();
;})

   
//Funcion para mostrar el Forecast actual de la ciudad buscada, luego del que el usuario clickea
//Creo keyAPI y le asigno API key
//Llamo a la API para mostrar 5 dias 
// Creo queryURL, le concateno lastCityEntered + la API
function displayCurrentForecast() {

    const keyAPI = "e191767b9e01f3764253f31072bff18a";
    let queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + lastCityEntered + "&appid=" + keyAPI;
   
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        reset();
        
        const forecastInfo = $("<div>");
        forecastInfo.addClass("forcastInfo");
        $(".current-selected-city").append(forecastInfo);
        forecastInfo.text(lastCityEntered);

       
        const today = new Date();
        const day = 60 * 60 * 24 * 1000;
       
        //Creo array vacio
        // A n Bins lo inicializo con 6
        const dateBins = {};
       
        const nBins = 6;

        for (let i = 0; i < nBins; i++) {
            const date = new Date(today.getTime() + i * day);
            dateBins[date.getDate()] = [];
          
        }

        const reports = response.list;
        for (const report of reports) {
            const reportDate = new Date(report.dt * 1000).getDate();
            dateBins[reportDate].push(report);
          
        }

        //Muestra el tiempo actual
        const currentTempArray = response.list[0];
       
        //Convierte kelvin a Celsius(C°)
        const celcius = Math.floor(currentTempArray.main.temp - 273.15);
        // append temperatura, humedad, velocidad del viento
        $(".current-selected-city-details").append("<p>" + "Temperature: " + celcius + "&#8451;" + "</p>");
        $(".current-selected-city-details").append("<p>" + "Humidity: " + currentTempArray.main.humidity + "%" + "</p>");
        // convierte a kilomtetro
        const km = Math.floor(currentTempArray.wind.speed * 1.60934);
        $(".current-selected-city-details").append("<p>" + "Wind Speed: " + km + " km/h" + "</p>");
        // append icono clima
        const iconCode = currentTempArray.weather[0].icon;
        const iconURL = "https://openweathermap.org/img/wn/" + iconCode + "@2x.png";
        $(".icon").attr("src", iconURL);
        $(".description").append("<div>"+ "Today:"+ currentTempArray.weather[0].description + "</div>")
         //Indica Indice UV
        getUV();
        console.log(dateBins);

        //Crea un bucle para mostrar los datos de los 5 dias
       
        for (let j = 1; j <= 5; j++) {
            const fiveDays = (new Date(today.getTime() + j * day));
            const year = fiveDays.getFullYear();
            let month = fiveDays.getMonth() + 1;
            const date = fiveDays.getDate();

            const futureArray = dateBins[date][0];
            const futureIconURL = "https://openweathermap.org/img/wn/" + futureArray.weather[0].icon + ".png";
            const futureTempCelcius = Math.floor(futureArray.main.temp - 273.15);
            const futureHumidity = futureArray.main.humidity;

            const html = (`
            <div class="future-card">
              <div class="future-card-body">
                <p class="future-title">${year}/${month}/${date}</p>
                <p><img class="icon" src="${futureIconURL}"></p>
                <p class="future-temp">Temp:${futureTempCelcius}&#8451;</p>
                <p class="future-humid">Humidity:${futureHumidity}%</p>
              </div>
            </div>
            `);

            futureForcastSection.insertAdjacentHTML("afterend", html);
        }
    })
}

//Funcion para obtener indice UV
function getUV() {
    const keyAPI = "e191767b9e01f3764253f31072bff18a";
    const queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + lastCityEntered + "&appid=" + keyAPI;
    
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response){

        const lat = response.coord.lat;
        const lon = response.coord.lon;
        const UVqueryURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + keyAPI + "&lat=" + lat + "&lon=" + lon;

        $.ajax({
            url: UVqueryURL,
            method: "GET"
        }).then(function (UVdata) {
            $(".UVdiv").empty();
            const UV = UVdata.value;
            $(".current-selected-city-details").append("<p class='UVdiv'>" + "UV index: " + "<span id='UVdiv'>" + UV + "</span>" + "</p>");
        })
    }) 
}

//Funcion para limpiar busqueda ciudades
function clearHistory(event){
    event.preventDefault()
    cityArray=[];
    localStorage.removeItem("storedCity");
    document.location.reload();


}
//La funcion al cambiar de ciudad, resetea y permite mostrar nuevos cambios
function reset() {
    $(".current-selected-city").empty();
    $(".current-selected-city-details").empty();
    $(".icon").empty();
    $(".future-forcast-section").empty();
    $(".future-card").empty();
    $(".description").empty();

}

