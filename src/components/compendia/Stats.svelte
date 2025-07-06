<script>
    export let stats = {};
    let totalArticles = stats.total_articles;
    let totalFacts = stats.total_fact_groups;
</script>

<div class="absolute left-10 bg-transparent shadow-lg rounded-lg p-2 ">
    <div class="mt-1 text-sm ">
        <p class="mb-1 text-black font-semibold dark:text-[rgba(255,255,255,0.6)] flex justify-between">
            Total Articles: <span class="font-bold dark:text-[#b785ff] pl-4">{totalArticles}</span>
        </p>
        <p class="m-0 text-black font-semibold dark:text-[rgba(255,255,255,0.6)] flex justify-between">
            Total Facts: <span class="font-bold dark:text-[rgba(255,255,255,0.6)]">{totalFacts}</span>
        </p>
    </div>
</div>
