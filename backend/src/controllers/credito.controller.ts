import { Request, Response } from 'express';
import {
  getSaldoCreditos,
  getCreditosPendientes,
  reclamarCreditosPendientes,
} from '../models/credito.model';

// GET saldo de créditos y créditos pendientes por reclamar
export const getMisCreditos = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  try {
    const [saldo, pendientes] = await Promise.all([
      getSaldoCreditos(userId),
      getCreditosPendientes(userId),
    ]);
    const totalPendiente = pendientes.reduce(
      (total, fila) => total + Number(fila.monto),
      0
    );
    res.json({ saldo, pendientes, totalPendiente });
  } catch (error) {
    console.error('Error al obtener créditos:', error);
    res.status(500).json({ error: 'Error al obtener créditos' });
  }
};

// POST reclamar los créditos disponibles del usuario autenticado
export const claimCreditos = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  try {
    const resultado = await reclamarCreditosPendientes(userId);
    if (!resultado) {
      return res.status(404).json({ message: 'No tienes créditos disponibles para reclamar' });
    }
    res.json({
      message: 'Créditos reclamados exitosamente',
      ...resultado,
    });
  } catch (error) {
    console.error('Error al reclamar créditos:', error);
    res.status(500).json({ error: 'Error al reclamar créditos' });
  }
};
