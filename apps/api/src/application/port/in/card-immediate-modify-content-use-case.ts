import { type LoadCardPort } from "../out/load-card-port";
import { type SaveCardPort } from "../out/save-card-port";
import { type EmitSocketPort } from "../out/emit-socket-port";
import { ContentModifyEvent } from "./content-modify-event";

export interface CardImmediateModifyContentUseCaseConstructor {
  (
    loadCard: LoadCardPort,
    saveCard: SaveCardPort,
    emitSocket: EmitSocketPort
  ): CardImmediateModifyContentUseCase;
}

export interface CardImmediateModifyContentUseCase {
  (props: ContentModifyEvent): Promise<Boolean>;
}
