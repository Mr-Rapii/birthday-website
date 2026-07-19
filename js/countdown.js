/* js/countdown.js
   Ganti BIRTHDATE di bawah kalau tanggal lahirnya beda.
   Format: 'YYYY-MM-DD'. Dihitung pakai UTC biar konsisten di semua device. */
(function(){
  const BIRTHDATE = '2010-08-14'; // TODO: ganti sesuai tanggal lahir kamu

  const [by, bm, bd] = BIRTHDATE.split('-').map(Number);

  function nextBirthdayUTC(now){
    let year = now.getUTCFullYear();
    let target = Date.UTC(year, bm-1, bd, 0,0,0);
    if(target <= now.getTime()){
      target = Date.UTC(year+1, bm-1, bd, 0,0,0);
    }
    return target;
  }

  function currentAge(now){
    let age = now.getUTCFullYear() - by;
    const hadBirthdayThisYear =
      (now.getUTCMonth()+1 > bm) ||
      (now.getUTCMonth()+1 === bm && now.getUTCDate() >= bd);
    if(!hadBirthdayThisYear) age--;
    return age;
  }

  const elDays = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMinutes = document.getElementById('cd-minutes');
  const elSeconds = document.getElementById('cd-seconds');
  const ageLine = document.getElementById('age-line');
  const label = document.getElementById('countdown-label');

  function pad(n){ return String(n).padStart(2,'0'); }

  function update(){
    const now = new Date();
    const target = nextBirthdayUTC(now);
    let diff = target - now.getTime();

    if(diff <= 0){
      label.textContent = 'Selamat ulang tahun hari ini! 🎉';
      diff = 0;
    }

    const days = Math.floor(diff / (1000*60*60*24));
    const hours = Math.floor((diff / (1000*60*60)) % 24);
    const minutes = Math.floor((diff / (1000*60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMinutes.textContent = pad(minutes);
    elSeconds.textContent = pad(seconds);

    const age = currentAge(now);
    const nextAge = age + 1;
    ageLine.textContent = `Sekarang umur ${age} tahun — menuju umur ${nextAge}`;
  }

  update();
  setInterval(update, 1000);
})();
