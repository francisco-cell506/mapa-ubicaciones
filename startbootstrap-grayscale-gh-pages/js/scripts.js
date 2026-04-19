document.addEventListener("DOMContentLoaded", function () {

  // 🔐 Supabase
  const supabaseUrl = "https://raaxbcxajfesildhhqff.supabase.co";
  const supabaseKey = "sb_publishable_8zbMDQMjQ7c_ciofDXqOQw_4Z1AU-i0";
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

  // 🎯 MODAL
  const modal = new bootstrap.Modal(document.getElementById("modalLugar"));

  // 🗺️ MAPA
  const map = L.map("map").setView([25.535151, -103.434648], 15);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);

  // 🔧 FIX MAPA BLANCO
  setTimeout(() => {
    map.invalidateSize();
  }, 500);

  // 🐶 ICONO
  const icono = L.icon({
    iconUrl: "assets/img/perro.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });

  // 📍 CLICK MAPA
  map.on("click", function (e) {
    document.getElementById("lat").value = e.latlng.lat;
    document.getElementById("lng").value = e.latlng.lng;
    modal.show();
  });

  // 📍 FUNCIÓN MARCADOR
  function agregarMarcador(p) {
    const marker = L.marker([p.lat, p.lng], { icon: icono }).addTo(map);

    marker.bindPopup(`
      <b>${p.placename}</b><br>
      Entre calles: ${p.between_streets}<br><br>
      <button class="btn btn-danger btn-sm" onclick="eliminar(${p.lat}, ${p.lng})">
        Eliminar
      </button>
    `);
  }

  // 🔄 CARGAR DATOS
  async function cargarDatos() {
    const { data, error } = await supabaseClient
      .from("cordinates")
      .select("*");

    if (error) {
      console.error("Error al cargar datos:", error);
      return;
    }

    data.forEach(p => agregarMarcador(p));
  }

  cargarDatos();

  // 💾 GUARDAR
  document.getElementById("formLugar").addEventListener("submit", async function (e) {
    e.preventDefault();

    const placename = document.getElementById("placename").value;
    const between_streets = document.getElementById("between_streets").value;
    const lat = parseFloat(document.getElementById("lat").value);
    const lng = parseFloat(document.getElementById("lng").value);

    const { error } = await supabaseClient
      .from("cordinates")
      .insert([{ placename, between_streets, lat, lng }]);

    if (error) {
      alert("Error al guardar");
      console.error("Error insert:", error);
      return;
    }

    agregarMarcador({ placename, between_streets, lat, lng });

    modal.hide();
    document.getElementById("formLugar").reset();
  });

  // 🗑️ ELIMINAR GLOBAL (IMPORTANTE PARA QUE FUNCIONE EL BOTÓN)
  window.eliminar = async function (lat, lng) {

    if (!confirm("¿Eliminar este lugar?")) return;

    const { error } = await supabaseClient
      .from("cordinates")
      .delete()
      .eq("lat", lat)
      .eq("lng", lng);

    if (error) {
      alert("Error al eliminar");
      console.error("Error delete:", error);
      return;
    }

    alert("Eliminado");
    location.reload();
  };

});