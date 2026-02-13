export type QuestionLevel = "beginner" | "intermediate" | "advanced";

export interface Stage {
  question: string;
  options: string[];
  correct: number;
}

export interface DiagnosticQuestion {
  id: number;
  level: QuestionLevel;
  scenario: string;
  errorMessage?: string;
  symptoms: string[];
  stage1: Stage;
  stage2: Stage;
}

export const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: 1,
    level: "beginner",
    scenario: "Rigidbody가 충돌할 때 OnCollisionEnter가 호출되지 않습니다.",
    errorMessage: "NullReferenceException: Object reference not set to an instance of an object",
    symptoms: [
      "두 물체가 충돌필 때 이벤트가 발생하지 않음",
      "스크립트는 GameObject에 부착되어 있음",
      "Rigidbody 컴포넌트가 존재함"
    ],
    stage1: {
      question: "이 버그의 가장 가능성 높은 원인은 무엇인가요?",
      options: [
        "Rigidbody 컴포넌트가 없음",
        "Collider가 IsTrigger로 설정됨",
        "GameObject가 비활성화됨",
        "스크립트에 오타가 있음"
      ],
      correct: 1
    },
    stage2: {
      question: "올바른 해결 방법은 무엇인가요?",
      options: [
        "IsTrigger를 해제하거나 OnTriggerEnter 메서드를 사용",
        "Rigidbody를 제거하고 다시 추가",
        "GameObject를 새로 생성",
        "Unity를 재설치"
      ],
      correct: 0
    }
  },
  {
    id: 2,
    level: "beginner",
    scenario: "Scene을 전환할 때 GameObject가 파괴(Destroy)되지 않고 유지되어야 하는데 사라집니다.",
    symptoms: [
      "DontDestroyOnLoad를 호출했음에도 불구하고 객체가 사라짐",
      "Scene 전환 시 배경음악이 끊김",
      "싱글톤 패턴을 사용 중"
    ],
    stage1: {
      question: "이 문제의 원인은 무엇인가요?",
      options: [
        "DontDestroyOnLoad를 잘못된 객체에 적용함",
        "Scene에 같은 객체가 여러 개 있어 중복 생성됨",
        "GameObject의 이름이 중복됨",
        "Scene 설정이 잘못됨"
      ],
      correct: 1
    },
    stage2: {
      question: "올바른 해결 방법은 무엇인가요?",
      options: [
        "Scene에 하나의 인스턴스만 존재하도록 중복 체크 로직 추가",
        "모든 Scene에 동일한 객체를 미리 배치",
        "DontDestroyOnLoad 호출을 제거",
        "Scene 전환을 사용하지 않음"
      ],
      correct: 0
    }
  },
  {
    id: 3,
    level: "intermediate",
    scenario: "Coroutine을 사용한 애니메이션 시퀀스가 예상보다 빠르게 실행됩니다.",
    errorMessage: "Coroutine couldn't be started because the the game object 'XXX' is inactive!",
    symptoms: [
      "WaitForSeconds가 무시되는 것처럼 보임",
      "애니메이션이 동시에 실행됨",
      "일부 코루틴이 완료되지 않음"
    ],
    stage1: {
      question: "이 버그의 원인은 무엇인가요?",
      options: [
        "Time.timeScale이 0으로 설정됨",
        "코루틴이 매 프레임마다 새로 시작됨",
        "WaitForSecondsRealtime을 사용하지 않음",
        "GameObject가 비활성화되면서 코루틴이 중단됨"
      ],
      correct: 1
    },
    stage2: {
      question: "올바른 해결 방법은 무엇인가요?",
      options: [
        "코루틴 시작 조건을 제대로 체크하여 중복 실행 방지",
        "모든 WaitForSeconds를 WaitForSecondsRealtime로 변경",
        "Time.timeScale을 1로 고정",
        "GameObject를 항상 활성화 상태로 유지"
      ],
      correct: 0
    }
  },
  {
    id: 4,
    level: "intermediate",
    scenario: "Unity Editor에서 플레이 모드 종료 후에도 정적(static) 변수의 값이 유지되어 다음 실행에 영향을 줍니다.",
    symptoms: [
      "플레이 모드 재진입 시 이전 데이터가 남아있음",
      "싱글톤 패턴에서 인스턴스가 null이 아님",
      "점수나 게임 상태가 초기화되지 않음"
    ],
    stage1: {
      question: "이 문제의 근본 원인은 무엇인가요?",
      options: [
        "Unity 에디터의 버그",
        "정적 변수는 Domain Reload 없이는 초기화되지 않음",
        "PlayerPrefs에 데이터가 저장됨",
        "DontDestroyOnLoad로 인해 객체가 유지됨"
      ],
      correct: 1
    },
    stage2: {
      question: "가장 권장되는 해결 방법은 무엇인가요?",
      options: [
        "RuntimeInitializeOnLoadMethod를 사용하여 정적 변수 초기화",
        "정적 변수 사용을 완전히 피함",
        "매번 Unity 에디터를 재시작",
        "ScriptableObject를 사용하여 상태 관리"
      ],
      correct: 0
    }
  },
  {
    id: 5,
    level: "advanced",
    scenario: "IL2CPP 빌드에서 Reflection을 사용한 코드가 런타임에 MissingMethodException을 발생시킵니다.",
    errorMessage: "MissingMethodException: Method not found: System.Void XXX.YYY::.ctor()",
    symptoms: [
      "Mono 빌드에서는 정상 작동",
      "IL2CPP 빌드에서만 문제 발생",
      "동적 타입 생성 관련 코드에서 에러",
      "iOS나 Android 빌드에서 크래시"
    ],
    stage1: {
      question: "IL2CPP에서 이 문제가 발생하는 근본적인 이유는 무엇인가요?",
      options: [
        "IL2CPP는 Reflection을 완전히 지원하지 않음",
        "IL2CPP는 코드 스트ripping으로 인해 사용되지 않는 코드가 제거됨",
        "IL2CPP는 .NET 버전이 낮음",
        "IL2CPP는 동적 코드 생성을 금지함"
      ],
      correct: 1
    },
    stage2: {
      question: "올바른 해결 방법은 무엇인가요?",
      options: [
        "link.xml에 Reflection으로 접근하는 타입을 preserve로 등록",
        "Reflection 사용을 완전히 중단",
        "Mono 백엔드로 전환",
        "동적 코드 생성 대신 정적 팩토리 메서드 사용"
      ],
      correct: 0
    }
  }
];

export interface DiagnosticResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  recommendedLevel: QuestionLevel;
  answers: {
    questionId: number;
    stage1Correct: boolean;
    stage2Correct: boolean;
    points: number;
  }[];
}

export function calculateResult(answers: Map<number, { stage1: number; stage2: number }>): DiagnosticResult {
  let totalScore = 0;
  let correctCount = 0;
  const detailedAnswers = [];

  for (const question of diagnosticQuestions) {
    const answer = answers.get(question.id);
    if (!answer) continue;

    const stage1Correct = answer.stage1 === question.stage1.correct;
    const stage2Correct = answer.stage2 === question.stage2.correct;
    
    let points = 0;
    if (stage1Correct) points += 10;
    if (stage2Correct) points += 10;
    if (stage1Correct && stage2Correct) {
      correctCount++;
      points += 5; // 완벽한 답변 보
    }

    totalScore += points;
    
    detailedAnswers.push({
      questionId: question.id,
      stage1Correct,
      stage2Correct,
      points
    });
  }

  const maxScore = diagnosticQuestions.length * 25;
  const percentage = (totalScore / maxScore) * 100;

  let recommendedLevel: QuestionLevel;
  if (percentage >= 80) {
    recommendedLevel = "advanced";
  } else if (percentage >= 50) {
    recommendedLevel = "intermediate";
  } else {
    recommendedLevel = "beginner";
  }

  return {
    score: totalScore,
    totalQuestions: diagnosticQuestions.length,
    correctAnswers: correctCount,
    recommendedLevel,
    answers: detailedAnswers
  };
}

export function getLevelLabel(level: QuestionLevel): string {
  switch (level) {
    case "beginner":
      return "초급";
    case "intermediate":
      return "중급";
    case "advanced":
      return "고급";
    default:
      return level;
  }
}

export function getLevelDescription(level: QuestionLevel): string {
  switch (level) {
    case "beginner":
      return "Unity 기초 개념부터 차근차근 학습하세요. 컴포넌트 시스템, 기본 물리, C# 스크립팅 기초에 집중하는 것이 좋습니다.";
    case "intermediate":
      return "중급 개념을 학습하여 실력을 향상시키세요. 코루틴, 이벤트 시스템, 메모리 관리, 최적화 기법에 집중하세요.";
    case "advanced":
      return "고급 개발자 수준입니다! 렌더링 파이프라인, IL2CPP, 고급 최적화, 아키텍처 패턴을 학습하며 전문성을 키워보세요.";
    default:
      return "";
  }
}
