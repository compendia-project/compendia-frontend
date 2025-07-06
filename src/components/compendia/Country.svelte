<script>
  import { onMount } from "svelte";

  export let countryCode = "sg";

  // Get country code using multiple fallback methods
  const getCountryCode = async () => {
    // Method 1: Try ipapi.co (supports CORS)
    try {
      const response = await fetch('https://ipapi.co/country/');
      
      if (response.ok) {
        const country = await response.text();
        if (country && country.trim().length === 2) {
          countryCode = country.trim().toLowerCase();
          console.log('Country detected via ipapi.co:', countryCode);
          return;
        }
      }
    } catch (err) {
      console.warn('ipapi.co failed:', err.message);
    }

    // Method 2: Try browser language as fallback
    try {
      const browserLang = navigator.language || navigator.userLanguage;
      if (browserLang && browserLang.includes('-')) {
        const langCountry = browserLang.split('-')[1];
        if (langCountry && langCountry.length === 2) {
          countryCode = langCountry.toLowerCase();
          console.log('Country inferred from browser language:', countryCode);
          return;
        }
      }
    } catch (err) {
      console.warn('Browser language detection failed:', err.message);
    }

    // Method 3: Try timezone-based detection
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const timezoneCountryMap = {
        'America/New_York': 'us',
        'America/Los_Angeles': 'us',
        'America/Chicago': 'us',
        'Europe/London': 'gb',
        'Europe/Paris': 'fr',
        'Europe/Berlin': 'de',
        'Asia/Tokyo': 'jp',
        'Asia/Shanghai': 'cn',
        'Asia/Singapore': 'sg',
        'Australia/Sydney': 'au'
      };
      
      if (timezoneCountryMap[timezone]) {
        countryCode = timezoneCountryMap[timezone];
        console.log('Country inferred from timezone:', countryCode);
        return;
      }
    } catch (err) {
      console.warn('Timezone detection failed:', err.message);
    }

    console.log('All detection methods failed, using default country code:', countryCode);
  };

  onMount(async () => {
    await getCountryCode();
  });
</script>
