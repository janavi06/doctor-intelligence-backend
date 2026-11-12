
import { readPublished } from "../../repositories/doctorRepository.js";
import { doctorSchema, normalizeDoctor } from "./doctorSchema.js";
import { getCachedDoctors } from "../../cache/memoryCache.js";

async function loadValidDoctors() {
  const rows = await readPublished();
  const doctors = [];
  const ids = new Set();

  for (const row of rows) {
    const parsed = doctorSchema.safeParse(row);

    if (!parsed.success) {
      console.warn("Skipping invalid doctor:", row.doctor_id);
      continue;
    }

    const doctor = normalizeDoctor(parsed.data);

    if (ids.has(doctor.doctor_id)) {
      console.warn("Skipping duplicate doctor ID:", doctor.doctor_id);
      continue;
    }

    ids.add(doctor.doctor_id);
    doctors.push(doctor);
  }

  return doctors;
}

export async function getDoctors() {
  return getCachedDoctors(loadValidDoctors);
}

export async function getDoctorById(id) {
  const doctors = await getDoctors();
  return doctors.find((doctor) => doctor.doctor_id === id) ?? null;
}

export async function searchDoctors(query = {}) {
  let doctors = await getDoctors();

  const search = (query.search ?? "").toLowerCase();
  const speciality = (query.speciality ?? "").toLowerCase();
  const city = (query.city ?? "").toLowerCase();
  const hospital = (query.hospital ?? "").toLowerCase();

  doctors = doctors.filter((doctor) => {
    const searchable = [
      doctor["Doctor Name"],
      doctor.Speciality,
      doctor.City,
      doctor["Working at"],
    ].join(" ").toLowerCase();

    return (
      (!search || searchable.includes(search)) &&
      (!speciality || doctor.Speciality.toLowerCase() === speciality) &&
      (!city || doctor.City.toLowerCase() === city) &&
      (!hospital || doctor["Working at"].toLowerCase() === hospital)
    );
  });

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  const total = doctors.length;

  return {
    data: doctors.slice((page - 1) * limit, page * limit),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getFilters() {
  const doctors = await getDoctors();

  const unique = (values) =>
    [...new Set(values.filter(Boolean))].sort();

  return {
    specialities: unique(doctors.map((d) => d.Speciality)),
    cities: unique(doctors.map((d) => d.City)),
    hospitals: unique(doctors.map((d) => d["Working at"])),
  };
}
