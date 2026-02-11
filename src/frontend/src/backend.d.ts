import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Answer {
    questionId: bigint;
    selectedIndex: bigint;
}
export interface Question {
    id: bigint;
    topic?: string;
    answerIndex: bigint;
    questionText: string;
    options: Array<string>;
    points: bigint;
}
export interface Submission {
    answers: Array<Answer>;
    user: Principal;
    score: bigint;
    questionCount: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addQuestion(question: Question): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bootstrap_admin_role(adminToken: string, userProvidedToken: string): Promise<void>;
    deleteQuestion(id: bigint): Promise<void>;
    getAllQuestions(): Promise<Array<Question>>;
    getById(questionId: bigint): Promise<Question>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMySubmissions(): Promise<Array<Submission>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserSubmissions(user: Principal): Promise<Array<Submission>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitAnswers(answers: Array<Answer>): Promise<Submission>;
    updateQuestion(updatedQuestion: Question): Promise<void>;
}
