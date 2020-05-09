const axios = require('axios');
const fetchDailyCountryData = async (country) => {

  let changeableUrl =' https://corona.lmao.ninja/v2/historical/USA/?lastdays=10'

    if (country){
      changeableUrl = `https://corona.lmao.ninja/v2/historical/${country}?lastdays=10`
    }


try {
  const {data:{timeline : {cases,deaths}}}  = await axios.get(changeableUrl);

const modifiedData ={
  cases,
  deaths,
}


//return modifiedData
} catch (error) {

}
console.log(modifiedData)
}

