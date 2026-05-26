import { Pool } from 'pg';
import crypto from 'crypto';

const pool = new Pool({ connectionString: 'postgresql://sigep_user:sigep_password_2024@localhost:5433/sigep_v2' });

async function sync() {
  const { rows: depts } = await pool.query("SELECT id FROM departamentos WHERE codigo = 'd1'");
  if (!depts.length) { console.error('No D1 dept found'); return; }
  const deptId = depts[0].id;

  let tablaId;
  const { rows: tablas } = await pool.query("SELECT id FROM tablas_config WHERE departamento_id = $1 AND tabla_id = 'd1-situacion-particular'", [deptId]);
  
  if (!tablas.length) {
    tablaId = crypto.randomUUID();
    await pool.query("INSERT INTO tablas_config (id, departamento_id, tabla_id, nombre, orden) VALUES ($1, $2, 'd1-situacion-particular', 'SITUACION PARTICULAR DE PERSONAL POLICIAL', 99)", [tablaId, deptId]);
    console.log('Inserted table d1-situacion-particular');
  } else {
    tablaId = tablas[0].id;
    console.log('Table already exists');
  }

  const rows = [
    { filaId: 'abandono_servicio', label: 'Abandono de servicio' },
    { filaId: 'abandono_servicio_pasivo_proceso', label: 'Aband. Serv. // Pasiv. Proceso' },
    { filaId: 'disponible_art_114_inc_1', label: 'Disponible Art. 114 inc. 1 ley 3823' },
    { filaId: 'disponible_art_203_inc_a', label: 'Disponible Art. 203 inc. A ley 3823' },
    { filaId: 'disponible_art_203_inc_b', label: 'Disponible Art. 203 inc. B ley 3823' },
    { filaId: 'disponible_por_enf_art_114_inc_2', label: 'Disponible por Enf. Art. 114 inc. 2 Ley 3823' },
    { filaId: 'disponible_por_enf_art_114_inc_2_art', label: 'Disponible por Enf. Art. 114 inc. 2 Ley 3823 ART' },
    { filaId: 'licencia_especial_sin_goce', label: 'Licencia especial sin goce de sueldo' },
    { filaId: 'pasivo_por_enf_art_116', label: 'Pasivo por Enf. Art. 116 Ley 3823' },
    { filaId: 'pasivo_por_enf_art_116_art', label: 'Pasivo por Enf. Art. 116 Ley 3823 ART' },
    { filaId: 'pasivo_por_enf_art_119_inc_1', label: 'Pasivo por Enf. Art. 119 inc. 1 Ley 3823' },
    { filaId: 'pasivo_por_enf_art_119_inc_1_art', label: 'Pasivo por Enf. Art. 119 inc. 1 Ley 3823 ART' },
    { filaId: 'pasivo_por_enf_art_119_inc_5', label: 'Pasivo por Enf. Art. 119 inc. 5 Ley 3823' },
    { filaId: 'pasivo_por_enf_art_119_inc_6', label: 'Pasivo por Enf. Art. 119 inc. 6 Ley 3823' },
    { filaId: 'renuncia_en_tramite', label: 'Renuncia en trámite' },
    { filaId: 'serv_efect_enfermedad_art_111_inc_2', label: 'Serv. Efect. Enfermedad Art. 111 inc. 2 Ley 3823' },
    { filaId: 'baja_laboral_art', label: 'Baja laboral ART' },
    { filaId: 'desafectacion_ptp', label: 'Desafectación de PTP' },
    { filaId: 'desvinculacion_ptp', label: 'Desvinculación PTP' },
  ];

  for (const r of rows) {
    const { rows: exist } = await pool.query("SELECT id FROM datos_comparativos WHERE tabla_config_id = $1 AND fila_id = $2", [tablaId, r.filaId]);
    if (!exist.length) {
      await pool.query("INSERT INTO datos_comparativos (id, tabla_config_id, fila_id, label, periodo_anterior, periodo_actual) VALUES ($1, $2, $3, $4, 0, 0)", [crypto.randomUUID(), tablaId, r.filaId, r.label]);
    }
  }
  console.log('Inserted all rows');
}
sync().then(() => { pool.end(); }).catch(console.error);
