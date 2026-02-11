import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // User Roles and Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Bootstrap Admin Role
  public shared ({ caller }) func bootstrap_admin_role(adminToken : Text, userProvidedToken : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot become admin");
    };
    AccessControl.initialize(accessControlState, caller, adminToken, userProvidedToken);
  };

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Question Type and Comparison Module
  type Question = {
    id : Nat;
    questionText : Text;
    options : [Text];
    answerIndex : Nat;
    points : Nat;
    topic : ?Text;
  };

  module Question {
    public func compareById(q1 : Question, q2 : Question) : Order.Order {
      Nat.compare(q1.id, q2.id);
    };
  };

  // Answer Type
  type Answer = {
    questionId : Nat;
    selectedIndex : Nat;
  };

  // Submission Type
  type Submission = {
    user : Principal;
    score : Nat;
    answers : [Answer];
    questionCount : Nat;
  };

  // Question Store Actor State
  let questions = Map.empty<Nat, Question>();
  let submissions = Map.empty<Principal, [Submission]>();
  var nextQuestionId = 1;

  // Admin Functions - Add, Delete, Update Questions
  public shared ({ caller }) func addQuestion(question : Question) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let id = nextQuestionId;
    let newQuestion : Question = {
      id;
      questionText = question.questionText;
      options = question.options;
      answerIndex = question.answerIndex;
      points = question.points;
      topic = question.topic;
    };
    questions.add(id, newQuestion);
    nextQuestionId += 1;
    id;
  };

  public shared ({ caller }) func deleteQuestion(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (questions.containsKey(id)) {
      questions.remove(id);
    } else {
      Runtime.trap("Not found");
    };
  };

  public shared ({ caller }) func updateQuestion(updatedQuestion : Question) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not questions.containsKey(updatedQuestion.id)) {
      Runtime.trap("Not found");
    };
    questions.add(updatedQuestion.id, updatedQuestion);
  };

  // Public query functions - accessible to all users including guests
  // Students need to see questions to take the quiz
  public query ({ caller }) func getAllQuestions() : async [Question] {
    questions.values().toArray().sort(Question.compareById);
  };

  public query ({ caller }) func getById(questionId : Nat) : async Question {
    switch (questions.get(questionId)) {
      case (null) { Runtime.trap("Not found") };
      case (?question) { question };
    };
  };

  // Student Submission - requires authenticated user (not guest)
  public shared ({ caller }) func submitAnswers(answers : [Answer]) : async Submission {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit answers");
    };

    var score = 0;
    for (answer in answers.values()) {
      switch (questions.get(answer.questionId)) {
        case (?question) {
          if (answer.selectedIndex == question.answerIndex) {
            score += question.points;
          };
        };
        case (null) {};
      };
    };

    let submission : Submission = {
      user = caller;
      score;
      answers;
      questionCount = answers.size();
    };

    // Store submission
    let userSubmissions = switch (submissions.get(caller)) {
      case (null) { [] };
      case (?subs) { subs };
    };
    submissions.add(caller, userSubmissions.concat([submission]));

    submission;
  };

  // Get user's submission history
  public query ({ caller }) func getMySubmissions() : async [Submission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view submissions");
    };
    switch (submissions.get(caller)) {
      case (null) { [] };
      case (?subs) { subs };
    };
  };

  // Admin can view any user's submissions
  public query ({ caller }) func getUserSubmissions(user : Principal) : async [Submission] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view other users' submissions");
    };
    switch (submissions.get(user)) {
      case (null) { [] };
      case (?subs) { subs };
    };
  };
};
