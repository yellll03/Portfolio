document.addEventListener("DOMContentLoaded", () => {
  const steps = ["form-step-1", "form-step-2", "form-step-3"];
  const progressSteps = ["step1", "step2", "step3"];
  let currentStep = 0;

  const showStep = (index) => {
    steps.forEach((id, i) => {
      document.getElementById(id).classList.toggle("hidden", i !== index);
      document.getElementById(progressSteps[i]).classList.toggle("active", i === index);
    });
    currentStep = index;
  };

  document.getElementById("go-to-booking").addEventListener("click", () => {
    document.getElementById("booking-section").scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("from").addEventListener("change", () => {
    const from = document.getElementById("from").value;
    document.getElementById("to").value =
      from === "Odiongan" ? "Batangas" :
      from === "Batangas" ? "Odiongan" : "";
  });

  const fareMap = {
    "Super Value": 700,
    "Tourist": 900,
    "Cabin": 1200,
    "Suite": 1500
  };

  const updateFare = () => {
    const cls = document.getElementById("class").value;
    const age = parseInt(document.getElementById("age").value);
    let base = fareMap[cls] || 0;
    let discount = 0;

    if (!cls || isNaN(age)) return;

    if (age <= 4) discount = 1;
    else if (age >= 60) discount = 0.2;
    else if (age <= 17) discount = 0.1;

    const finalFare = discount === 1 ? 0 : base - (base * discount);
    document.getElementById("fare").value = `PHP ${finalFare.toLocaleString()}`;
    document.getElementById("fare").dataset.final = finalFare;
  };

  document.getElementById("class").addEventListener("change", updateFare);
  document.getElementById("age").addEventListener("input", updateFare);

  document.getElementById("next1").onclick = () => {
    if (validateStep1()) showStep(1);
  };
  document.getElementById("back1").onclick = () => showStep(0);
  document.getElementById("next2").onclick = () => {
    if (validateStep2()) {
      showReview();
      showStep(2);
    }
  };
  document.getElementById("back2").onclick = () => showStep(1);

  document.getElementById("cancel").onclick = () => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      window.location.reload();
    }
  };

  const showReview = () => {
    const cls = document.getElementById("class").value;
    let seatNum = (cls === "Suite" || cls === "Cabin")
      ? `Room No. ${Math.floor(100 + Math.random() * 900)}`
      : `Bed No. ${Math.floor(1 + Math.random() * 50)}`;

    const summary = `
      <p><strong>Name:</strong> ${document.getElementById("name").value}</p>
      <p><strong>Email:</strong> ${document.getElementById("email").value}</p>
      <p><strong>Gender:</strong> ${document.getElementById("gender").value}</p>
      <p><strong>Age:</strong> ${document.getElementById("age").value}</p>
      <p><strong>From:</strong> ${document.getElementById("from").value}</p>
      <p><strong>To:</strong> ${document.getElementById("to").value}</p>
      <p><strong>Date:</strong> ${document.getElementById("date").value}</p>
      <p><strong>Time:</strong> ${document.getElementById("time").value}</p>
      <p><strong>Class:</strong> ${cls}</p>
      <p><strong>${seatNum}</strong></p>
      <p><strong>Fare:</strong> ${document.getElementById("fare").value}</p>
    `;
    document.getElementById("review-summary").innerHTML = summary;
  };

  document.getElementById("booking-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const finalFare = document.getElementById("fare").dataset.final;
    const name = document.getElementById("name").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const from = document.getElementById("from").value;
    const to = document.getElementById("to").value;
    const cls = document.getElementById("class").value;
    const code = `LS-${Math.floor(100000 + Math.random() * 900000)}`;

    const qrData = `${code}|${name}|${from}->${to}|${date} ${time}|PHP ${finalFare}`;
    document.getElementById("qr-code").src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

    document.getElementById("receipt-text").innerHTML = `
      <strong>Booking Code:</strong> ${code}<br>
      <strong>Name:</strong> ${name}<br>
      <strong>Route:</strong> ${from} to ${to}<br>
      <strong>Date:</strong> ${date} - ${time}<br>
      <strong>Class:</strong> ${cls}<br>
      <strong>Fare:</strong> PHP ${parseFloat(finalFare).toLocaleString()}
    `;
    document.getElementById("receipt-modal").classList.remove("hidden");

    setTimeout(() => {
      document.getElementById("receipt-modal").classList.add("hidden");
      document.getElementById("booking-form").reset();
      document.getElementById("fare").value = "";
      showStep(0);
      document.getElementById("booking-section").scrollIntoView({ behavior: "smooth" });
    }, 4000);
  });

  document.getElementById("close-modal").onclick = () => {
    document.getElementById("receipt-modal").classList.add("hidden");
  };

  const validateStep1 = () => {
    const name = document.getElementById("name").value.trim();
    const age = document.getElementById("age").value;
    const gender = document.getElementById("gender").value;
    const email = document.getElementById("email").value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[a-zA-Z\s.'-]+$/;
    const blockedDomains = ["tempmail.com", "mailinator.com", "10minutemail.com"];
    const domain = email.split("@")[1];
    const ageNum = parseInt(age);

    if (!name || !age || !gender || !email) {
      alert("Please fill out all required passenger fields.");
      return false;
    }

    if (!nameRegex.test(name)) {
      alert("Name can only contain letters and basic punctuation.");
      return false;
    }

    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      alert("Please enter a valid age.");
      return false;
    }

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return false;
    }

    if (blockedDomains.includes(domain)) {
      alert("Please use a valid personal email address.");
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    const from = document.getElementById("from").value;
    const to = document.getElementById("to").value;
    const dateInput = document.getElementById("date").value;
    const timeInput = document.getElementById("time").value;
    const cls = document.getElementById("class").value;
    const fareValue = document.getElementById("fare").dataset.final;

    if (!from || !to || !dateInput || !timeInput || !cls) {
      alert("Please complete all travel details.");
      return false;
    }

    if (from === to) {
      alert("Departure and arrival locations cannot be the same.");
      return false;
    }

    const convertedTime = convertTo24Hour(timeInput);
    const fullDateTimeString = `${dateInput}T${convertedTime}`;
    const selectedDateTime = new Date(fullDateTimeString);
    const now = new Date();

    if (isNaN(selectedDateTime.getTime())) {
      alert("Invalid date or time format.");
      return false;
    }

    if (selectedDateTime <= now || selectedDateTime.getFullYear() < 2025) {
      alert("Travel date and time must be in the future (2025 onwards).");
      return false;
    }

    if (!fareValue || parseFloat(fareValue) <= 0) {
      alert("Please select a valid class and age to calculate the fare.");
      return false;
    }

    return true;
  };

  const convertTo24Hour = (timeStr) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) {
      hours += 12;
    }
    if (modifier === "AM" && hours === 12) {
      hours = 0;
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  showStep(0);
});

window.onscroll = () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (scrollTop / scrollHeight) * 100;
  document.getElementById("scroll-progress").style.width = scrolled + "%";
};
