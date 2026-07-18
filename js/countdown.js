// countdown.js - computes age and countdown towards next birthday

(function(){
  // Birthdate from user: 2010-08-14
  const BIRTH = new Date(Date.UTC(2010,7,14,0,0,0)); // month index 7 == August

  // Elements
  const ageYearsEl = document.getElementById('ageYears');
  const ageDaysEl = document.getElementById('ageDays');
  const ageTimeEl = document.getElementById('ageTime');
  const countdownTimerEl = document.getElementById('countdownTimer');
  const countdownLabelEl = document.getElementById('countdownLabel');

  function getNextBirthday(now){
    const year = now.getUTCFullYear();
    let next = new Date(Date.UTC(year,7,14,0,0,0));
    if(now.getTime() > next.getTime()){
      next = new Date(Date.UTC(year+1,7,14,0,0,0));
    }
    return next;
  }

  function calcAgeParts(now){
    // Calculate age in years and remaining days/hms for display
    const yrs = now.getUTCFullYear() - BIRTH.getUTCFullYear();
    const hadBirthdayThisYear = (now.getUTCMonth() > BIRTH.getUTCMonth()) || (now.getUTCMonth() === BIRTH.getUTCMonth() && now.getUTCDate() >= BIRTH.getUTCDate());
    const years = hadBirthdayThisYear ? yrs : yrs - 1;

    // days since last birthday
    const lastBirthdayYear = hadBirthdayThisYear ? now.getUTCFullYear() : now.getUTCFullYear()-1;
    const lastBirthday = new Date(Date.UTC(lastBirthdayYear, BIRTH.getUTCMonth(), BIRTH.getUTCDate(), 0,0,0));
    const diffMs = now - lastBirthday;
    const days = Math.floor(diffMs / (1000*60*60*24));

    // time of day
    const h = String(now.getUTCHours()).padStart(2,'0');
    const m = String(now.getUTCMinutes()).padStart(2,'0');
    const s = String(now.getUTCSeconds()).padStart(2,'0');

    return {years, days, time:`${h}:${m}:${s}`};
  }

  function formatCountdown(ms){
    if(ms <= 0) return '0d 0h 0m 0s';
    const s = Math.floor(ms/1000);
    const days = Math.floor(s / (3600*24));
    const hours = Math.floor((s % (3600*24)) / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${days}d ${hours}h ${mins}m ${secs}s`;
  }

  function tick(){
    const now = new Date();
    // Age display
    const age = calcAgeParts(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds())));
    if(ageYearsEl) ageYearsEl.textContent = age.years;
    if(ageDaysEl) ageDaysEl.textContent = age.days;
    if(ageTimeEl) ageTimeEl.textContent = age.time;

    // Countdown
    const next = getNextBirthday(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds())));
    const diff = next - now;

    if(diff <= 0){
      if(countdownLabelEl) countdownLabelEl.textContent = 'Hari Ini Ulang Tahun Rafi';
      if(countdownTimerEl) countdownTimerEl.textContent = '🎉 SELAMAT ULANG TAHUN 🎉';
    }else{
      if(countdownLabelEl) countdownLabelEl.textContent = 'Countdown ke ulang tahun:';
      if(countdownTimerEl) countdownTimerEl.textContent = formatCountdown(diff);
    }
  }

  // Start ticking every 1s
  setInterval(tick, 1000);
  // initial
  tick();

  window.__UBV2_countdown = { BIRTH };
})();
