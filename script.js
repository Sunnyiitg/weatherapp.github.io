//tabs
const userTab=document.querySelector("[data-userWeather]");
const searchTab=document.querySelector("[data-searchWeather]")
//weather info
const userContainer=document.querySelector(".weather-container");

const grantAccessContainer=document.querySelector(".grant-location-container");
const searchForm =document.querySelector("[data-searchForm]");
const loadingScreen=document.querySelector(".loading-container");
const userInfoContainer=document.querySelector(".user-info-container");

// initially i need api key and current tab(for switching to next tab)
let currentTab=userTab; //by default current tab is user tab
const API_KEY="c10a2845d6d2b7c8094bf72094c9b3e8";
currentTab.classList.add("current-tab");
// currentTab k corresponding jo bhi css property h usko add krdenge
getfromSessionStorage();

//i need a function to switch tabs
function switchTab(clickedTab)
{
    // ye bhi toh ho sakta h ki mai jis tab pe pahle se hu
    // usi pe click krdiya => toh kuch nahi hona chahiye
    if(currentTab!=clickedTab) //both tabs are differ
    {
        //color changing
        currentTab.classList.remove("current-tab");
        currentTab=clickedTab;
        currentTab.classList.add("current-tab");
        // isse bg color change hojyega
        // jispe click kiya uspe lag jata h purane wale se htt jata h
        // abhi mujhe nai pata kaun se tab pe hu
        if(!searchForm.classList.contains("active"))
        { //phle invisible tha or tab switch hua h
            //agar isme active nahi pada h
            // mtlb active karna h isko
            // qki koi bhi tab agar visible hai toh usme active class added h
            // agar search form me jana h toh
            // grand access or user se active htao
            userInfoContainer.classList.remove("active"); //invisible
            grantAccessContainer.classList.remove("active"); //invisible
            searchForm.classList.add("active"); //visible
        }
        else{
            // mai phle search wale pe tha ab your weather tab visible karna h
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            // your weather pe click karne pe apne aap weather aarha
            // mtlb apne aap coordinate mil rha
            
            //ab mai yourweather me aagya hu toh weather display krna hoga
            // so check local storage for your coordinates
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click",()=>{
    // pass clicked tab
    switchTab(userTab);
});
searchTab.addEventListener("click",()=>{
    // pass clicked tab
    switchTab(searchTab);
});


function getfromSessionStorage()
{
    //checks if coordinates are already present in session storage
    const localCoordinates=sessionStorage.getItem("user-coordinates"); //string
    if(!localCoordinates)
    {
        // local coordinates nai mile
        // mtlb location access nai diya
        // mtlb grant location dena hoga
        grantAccessContainer.classList.add("active");
    }
    else{
        //coordinates hai=> use karo
        const coordinates=JSON.parse(localCoordinates); // converting string to object
        //json string to json object
        fetchUserWeatherInfo(coordinates); 
        //function to fetch weather according to passed coordinates
    }
}
async function fetchUserWeatherInfo(coordinates)
{
    const {lat,lon}=coordinates;
    // i have to do api call =>async call
    // have to do loading screen
    // mtlb grand access htao
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");

    // API CALL
    try{
        const response= await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data=await response.json(); //convert into json
        //loader htao
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        //data bhi toh dikhani h =>render krni h
        renderWeatherInfo(data);
        //data me se value nikalega or render karega
    }
    catch(err){
        loadingScreen.classList.remove("active");
        console.log("error");
    }
}

function renderWeatherInfo(weatherInfo)
{
    //location,city,countrycode,temp,windspeed,humidity
    //saare element fetch krne padenge pahle toh
    const cityName=document.querySelector("[data-cityName]");
    const countryIcon=document.querySelector("[data-countryIcon]");
    const desc=document.querySelector("[data-weatherDesc]");
    const weatherIcon=document.querySelector("[data-weatherIcon]");
    const temp=document.querySelector("[data-temp]");
    const windSpeed=document.querySelector("[data-windspeed]");
    const humidity=document.querySelector("[data-humidity]");
    const cloudiness=document.querySelector("[data-cloudiness]");
    //fetching values from data and putting in UI elements
    //user?.address?.zip => ? agar address hai toh jao wrna undefined do error nahi
    cityName.innerText=weatherInfo?.name; 
    countryIcon.src=`https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText=weatherInfo?.weather?.[0]?.description;
    weatherIcon.src=`http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText=`${weatherInfo?.main?.temp} °C`;
    windSpeed.innerText=`${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText=`${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText=`${weatherInfo?.clouds?.all} %`;
}

function getLocation()
{
    if(navigator.geolocation){
        //support available
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        //show alert for no geolocation
        console.log("no geolocation");
    }
}
function showPosition(position)
{
    const userCoordinates={
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    // sessionStorage.setItem(keyname, value)
    fetchUserWeatherInfo(userCoordinates);
}
//agar grant access dikh rha h toh
// listner lga h button pe => location find karo
// session storage me dalo
const grantAccessButton=document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click",getLocation);

const searchInput=document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    // The preventDefault() method cancels the event if it is cancelable, 
    // meaning that the default action that belongs to the event will not occur.
    let cityName=searchInput.value;
    if(cityName === "")
    {
        return;
    }
    else fetchSearchWeatherInfo(cityName);
})

async function fetchSearchWeatherInfo(city)
{
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    try{
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err){
        //handle
    }
}

