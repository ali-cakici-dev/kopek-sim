document.addEventListener('DOMContentLoaded', function () {
    const dogCountSlider = document.getElementById('dogCount');
    const dogLifeSlider = document.getElementById('dogLife');
    const shelterCountSlider = document.getElementById('shelterCount');
    const captureCapacitySlider = document.getElementById('captureCapacity');
    const methodSelect = document.getElementById('method');

    const dogCountValueDisplay = document.getElementById('dogCountValue');
    const dogLifeValueDisplay = document.getElementById('dogLifeValue');
    const shelterCountValueDisplay = document.getElementById('shelterCountValue');
    const captureCapacityValueDisplay = document.getElementById('captureCapacityValue');

    let monthlyCostChart, dogPopulationChart;

    function displaySliderValues() {
        dogCountValueDisplay.textContent = dogCountSlider.value;
        dogLifeValueDisplay.textContent = dogLifeSlider.value;
        shelterCountValueDisplay.textContent = shelterCountSlider.value;
        captureCapacityValueDisplay.textContent = captureCapacitySlider.value;
    }

    function updateCharts() {
        displaySliderValues();

        const initialDogCount = parseInt(dogCountSlider.value);
        const dogLife = parseInt(dogLifeSlider.value);
        const shelterCount = parseInt(shelterCountSlider.value);
        const dailyCapacity = parseInt(captureCapacitySlider.value);
        const method = methodSelect.value;

        const years = Array.from({ length: 10 }, (_, i) => i + 1);
        const dogPopulation = [];
        const yearlyCost = [];

        let currentDogCount = initialDogCount;

        for (let year = 1; year <= 10; year++) {
            let nonSterilizedCount = currentDogCount;
            if (method === 'sterilization') {
                let sterilizedCount = Math.min(currentDogCount, shelterCount * dailyCapacity * 365);
                nonSterilizedCount -= sterilizedCount;
            }

            if (method === 'euthanasia') {
                let dailyRemoval = Math.min(currentDogCount, shelterCount * dailyCapacity * 365);
                currentDogCount -= dailyRemoval;
                nonSterilizedCount -= dailyRemoval;
            }

            currentDogCount += nonSterilizedCount * 6;
            currentDogCount -= currentDogCount / dogLife;
            currentDogCount = Math.max(0, currentDogCount);
            dogPopulation.push(Math.round(currentDogCount));

            let additionalShelters = Math.max(0, shelterCount - 250); // İlk 250 barınak ücretsiz
            let annualCost = (additionalShelters * 12) + (additionalShelters * 40 / 10);
            yearlyCost.push(annualCost);
        }

        if (monthlyCostChart) monthlyCostChart.destroy();
        if (dogPopulationChart) dogPopulationChart.destroy();

        const monthlyCostCtx = document.getElementById('monthlyCostChart').getContext('2d');
        monthlyCostChart = new Chart(monthlyCostCtx, {
            type: 'bar',
            data: {
                labels: years.map(y => `Yıl ${y}`),
                datasets: [{
                    label: 'Yıllık Harcama (milyon TL)',
                    data: yearlyCost,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,

                    }
                }
            }

        });

        const dogPopulationCtx = document.getElementById('dogPopulationChart').getContext('2d');
        dogPopulationChart = new Chart(dogPopulationCtx, {
            type: 'line',
            data: {
                labels: years.map(y => `Yıl ${y}`),
                datasets: [{
                    label: 'Köpek Sayısı',
                    data: dogPopulation,
                    fill: false,
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value, index, values) {
                                const formattedValue = (value / 1000000) + 'M';
                                console.log(`Original: ${value}, Formatted: ${formattedValue}`);
                                return formattedValue;
                            }
                        }
                    }
                }
            }
        });
    }



    document.querySelectorAll('input[type="range"], select').forEach(item => {
        item.addEventListener('input', updateCharts);
    });

    updateCharts();
});
