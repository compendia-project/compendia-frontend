<script>
  import { onMount } from "svelte";
  import localStorage from "$utils/localStorage";

  export let countryCode = "sg";

  const COUNTRY_STORAGE_KEY = "user_country_code";
  const COUNTRY_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  // Get country code using localStorage cache first, then fallback methods
  const getCountryCode = async () => {
    // First, check localStorage for cached country code
    try {
      const cachedData = localStorage.get(COUNTRY_STORAGE_KEY);
      if (cachedData && cachedData.countryCode && cachedData.timestamp) {
        const now = Date.now();
        const cacheAge = now - cachedData.timestamp;

        // Use cached data if it's less than 24 hours old
        if (cacheAge < COUNTRY_CACHE_DURATION) {
          countryCode = cachedData.countryCode;
          console.log("Country loaded from cache:", countryCode);
          return;
        } else {
          console.log("Cached country data expired, fetching new data");
        }
      }
    } catch (err) {
      console.warn("Failed to read country from cache:", err.message);
    }
    // Method 1: Try ipapi.co (supports CORS)
    try {
      const response = await fetch("https://ipapi.co/country/");

      if (response.ok) {
        const country = await response.text();
        if (country && country.trim().length === 2) {
          countryCode = country.trim().toLowerCase();
          console.log("Country detected via ipapi.co:", countryCode);

          // Save successful API result to cache
          try {
            localStorage.set(COUNTRY_STORAGE_KEY, {
              countryCode: countryCode,
              timestamp: Date.now(),
            });
          } catch (err) {
            console.warn("Failed to cache country from API:", err.message);
          }

          return;
        }
      }
    } catch (err) {
      console.warn("ipapi.co failed:", err.message);
    }

    // Method 3: Try timezone-based detection
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const timezoneCountryMap = {
        "America/New_York": "us",
        "America/Los_Angeles": "us",
        "America/Chicago": "us",
        "Europe/London": "gb",
        "Europe/Paris": "fr",
        "Europe/Berlin": "de",
        "Asia/Tokyo": "jp",
        "Asia/Shanghai": "cn",
        "Asia/Singapore": "sg",
        "Australia/Sydney": "au",
      };

      if (timezoneCountryMap[timezone]) {
        countryCode = timezoneCountryMap[timezone];
        console.log("Country inferred from timezone:", countryCode);
        try {
          localStorage.set(COUNTRY_STORAGE_KEY, {
            countryCode: countryCode,
            timestamp: Date.now(),
          });
          console.log("Country code saved to cache:", countryCode);
        } catch (err) {
          console.warn("Failed to save country to cache:", err.message);
        }
        return;
      }
    } catch (err) {
      console.warn("Timezone detection failed:", err.message);
    }

    console.log(
      "All detection methods failed, using default country code:",
      countryCode
    );
  };

  onMount(async () => {
    await getCountryCode();
  });
</script>
