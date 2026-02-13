/**
 * Prisma Seed Script
 * 
 * 테스트 데이터 생성:
 * 1. 테스트 사용자 (Better Auth로 생성)
 * 2. 카테고리 5개
 * 3. 각 레벨별 퀴즈 3개씩 (총 15개)
 * 4. 테스트 사용자의 학습 진도
 * 
 * 실행: npx prisma db seed
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Prisma Enums (스키마에서 생성됨)
const UserLevel = {
  Beginner: "Beginner",
  Intermediate: "Intermediate",
  Advanced: "Advanced",
  Expert: "Expert",
  Master: "Master",
} as const

const QuizLevel = {
  Easy: "Easy",
  Medium: "Medium",
  Hard: "Hard",
} as const

type QuizLevelType = typeof QuizLevel[keyof typeof QuizLevel]

// ============================================================================
// 테스트 데이터 설정
// ============================================================================

const TEST_USER = {
  email: "test@example.com",
  password: "password123",
  name: "테스트 사용자",
  level: UserLevel.Intermediate,
}

const CATEGORIES = [
  {
    name: "NullReferenceException",
    description: "Unity에서 가장 흔하게 발생하는 null 참조 예외와 해결 방법",
    icon: "bug",
  },
  {
    name: "Performance",
    description: "프레임 저하, 메모리 누수, 최적화 문제 진단",
    icon: "zap",
  },
  {
    name: "Physics",
    description: "Rigidbody, Collision, Raycast 등 물리 관련 버그",
    icon: "box",
  },
  {
    name: "Animation",
    description: "Animator, AnimationClip, 트랜지션 문제 해결",
    icon: "play",
  },
  {
    name: "UI",
    description: "Canvas, RectTransform, EventSystem UI 버그",
    icon: "layout",
  },
]

// 퀴즈 레벨 매핑 (요구사항 5단계 → 스키마 3단계)
const LEVEL_MAPPING: Record<string, QuizLevelType> = {
  Beginner: QuizLevel.Easy,
  Intermediate: QuizLevel.Easy,
  Advanced: QuizLevel.Medium,
  Expert: QuizLevel.Hard,
  Master: QuizLevel.Hard,
}

// 각 UserLevel별 퀴즈 데이터
const QUIZZES_BY_LEVEL = {
  Beginner: [
    {
      title: "Missing Rigidbody 참조",
      description: "플레이어 캐릭터가 움직이지 않고 콘솔에 오류가 표시됩니다.",
      codeSnippet: `public class PlayerController : MonoBehaviour {
    public Rigidbody rb;
    
    void Start() {
        rb.velocity = Vector3.forward * 10f;
    }
}`,
      options: [
        { id: "A", text: "Rigidbody가 GameObject에 없음", isCause: true },
        { id: "B", text: "velocity 값이 너무 작음", isCause: false },
        { id: "C", text: "Start() 대신 Awake() 사용", isCause: false },
        { id: "D", text: "Time.deltaTime 미사용", isCause: false },
        { id: "E", text: "GetComponent<Rigidbody>() 추가", isCause: false },
        { id: "F", text: "Inspector에서 Rigidbody 할당", isCause: false },
      ],
      correctCause: "A",
      correctSolution: "E",
      explanation: "public 필드로 선언된 Rigidbody가 Inspector에서 할당되지 않았거나, GetComponent로 가져오지 않아 null 상태입니다. Start()에서 GetComponent<Rigidbody>()를 호출하거나 Inspector에서 직접 할당해야 합니다.",
      hint: "컴포넌트 참조는 코드로 가져오거나 Inspector에서 할당해야 합니다.",
    },
    {
      title: "FindGameObjectWithTag 반환 null",
      description: "적(Enemy) 오브젝트를 찾을 때 null 오류가 발생합니다.",
      codeSnippet: `void Attack() {
    GameObject enemy = GameObject.FindGameObjectWithTag("Enemy");
    enemy.GetComponent<Health>().Damage(10);
}`,
      options: [
        { id: "A", text: "태그가 'Enemy'인 오브젝트가 씬에 없음", isCause: true },
        { id: "B", text: "FindGameObjectWithTag는 배열을 반환함", isCause: false },
        { id: "C", text: "Attack()이 너무 자주 호출됨", isCause: false },
        { id: "D", text: "null 체크 후 early return", isCause: false },
        { id: "E", text: "태그를 'Enemys'로 변경", isCause: false },
        { id: "F", text: "FindObjectOfType<Health>() 사용", isCause: false },
      ],
      correctCause: "A",
      correctSolution: "D",
      explanation: "FindGameObjectWithTag는 해당 태그를 가진 오브젝트가 없을 때 null을 반환합니다. 항상 null 체크를 수행하거나, ?. 연산자를 사용하여 null 참조 예외를 방지해야 합니다.",
      hint: "씬에 해당 태그를 가진 오브젝트가 있는지, 그리고 null 체크는 했는지 확인하세요.",
    },
    {
      title: "UI Text 업데이트 실패",
      description: "점수가 UI에 표시되지 않습니다.",
      codeSnippet: `public class ScoreManager : MonoBehaviour {
    public Text scoreText;
    private int score = 0;
    
    public void AddScore(int points) {
        score += points;
        scoreText.text = "Score: " + score;
    }
}`,
      options: [
        { id: "A", text: "scoreText가 Inspector에서 할당되지 않음", isCause: true },
        { id: "B", text: "Text 클래스를 using해야 함", isCause: false },
        { id: "C", text: "score 변수가 static이어야 함", isCause: false },
        { id: "D", text: "GameObject.Find()로 Text 찾기", isCause: false },
        { id: "E", text: "scoreText를 public static으로 변경", isCause: false },
        { id: "F", text: "SerializeField와 private 사용", isCause: false },
      ],
      correctCause: "A",
      correctSolution: "D",
      explanation: "public으로 선언된 Text 필드가 Unity Inspector에서 할당되지 않아 null입니다. 코드에서 GetComponentInChildren<Text>()나 GameObject.Find()를 사용하여 동적으로 찾거나, Inspector에서 직접 연결해야 합니다.",
      hint: "public 필드는 Inspector에서 할당되지 않으면 null입니다.",
    },
  ],
  Intermediate: [
    {
      title: "Coroutine 중지되지 않음",
      description: "씬을 다시 로드할 때 이전 씬의 Coroutine이 계속 실행됩니다.",
      codeSnippet: `public class Spawner : MonoBehaviour {
    void Start() {
        StartCoroutine(SpawnEnemies());
    }
    
    IEnumerator SpawnEnemies() {
        while(true) {
            Instantiate(enemyPrefab);
            yield return new WaitForSeconds(2f);
        }
    }
}`,
      options: [
        { id: "A", text: "DontDestroyOnLoad로 인해 객체가 파괴 안됨", isCause: false },
        { id: "B", text: "StopAllCoroutines()를 호출하지 않음", isCause: true },
        { id: "C", text: "while(true)는 무조건 bad practice", isCause: false },
        { id: "D", text: "OnDestroy()에서 StopAllCoroutines() 호출", isCause: false },
        { id: "E", text: "Coroutine을 static으로 선언", isCause: false },
        { id: "F", text: "SceneManager.sceneLoaded 이벤트 사용", isCause: false },
      ],
      correctCause: "B",
      correctSolution: "D",
      explanation: "씬이 언로드될 때 Coroutine은 자동으로 중지되지 않습니다. OnDestroy()에서 StopAllCoroutines()를 호출하거나, StopCoroutine()으로 특정 코루틴을 중지해야 합니다.",
      hint: "씬 전환 시 실행 중인 Coroutine은 명시적으로 중지해야 합니다.",
    },
    {
      title: "Event Listener 중복 등록",
      description: "버튼 클릭이 한 번에 여러 번 실행됩니다.",
      codeSnippet: `public class ButtonHandler : MonoBehaviour {
    void OnEnable() {
        button.onClick.AddListener(OnClick);
    }
    
    void OnClick() {
        Debug.Log("Clicked!");
    }
}`,
      options: [
        { id: "A", text: "onClick.AddListener가 OnEnable에서 매번 호출됨", isCause: true },
        { id: "B", text: "버튼이 여러 개 생성됨", isCause: false },
        { id: "C", text: "Debug.Log가 여러 번 출력됨", isCause: false },
        { id: "D", text: "OnDisable()에서 RemoveListener 호출", isCause: false },
        { id: "E", text: "AddListener 대신 Inspector에서 연결", isCause: false },
        { id: "F", text: "button.onClick.RemoveAllListeners() 호출", isCause: false },
      ],
      correctCause: "A",
      correctSolution: "D",
      explanation: "OnEnable은 객체가 활성화될 때마다 호출되므로, 리스너가 중복 등록됩니다. OnDisable에서 RemoveListener로 해제하거나, Start에서 한 번만 등록해야 합니다.",
      hint: "OnEnable에는 항상 OnDisable에서 정리하는 것이 좋습니다.",
    },
    {
      title: "Rigidbody 움직임 끊김",
      description: "FixedUpdate에서 Rigidbody를 움직이는데 화면이 끊깁니다.",
      codeSnippet: `void FixedUpdate() {
    rb.MovePosition(transform.position + direction * speed * Time.deltaTime);
}`,
      options: [
        { id: "A", text: "FixedUpdate는 프레임 레이트와 다름", isCause: true },
        { id: "B", text: "MovePosition 대신 position 사용", isCause: false },
        { id: "C", text: "Time.fixedDeltaTime을 사용해야 함", isCause: false },
        { id: "D", text: "Time.deltaTime 대신 Time.fixedDeltaTime 사용", isCause: false },
        { id: "E", text: "Update()로 이동 로직 옮기기", isCause: false },
        { id: "F", text: "rb.velocity를 직접 설정", isCause: false },
      ],
      correctCause: "A",
      correctSolution: "D",
      explanation: "FixedUpdate는 고정된 시간 간격(기본 0.02초)으로 호출됩니다. Rigidbody 관련 작업은 FixedUpdate에서 해야 하지만, Time.deltaTime 대신 Time.fixedDeltaTime을 사용해야 정확한 물리 계산이 가능합니다.",
      hint: "FixedUpdate에서는 Time.fixedDeltaTime을 사용하세요.",
    },
  ],
  Advanced: [
    {
      title: "메모리 누수 - Texture2D",
      description: "런타임에 생성된 텍스처가 메모리에서 해제되지 않습니다.",
      codeSnippet: `public class ScreenshotCapture : MonoBehaviour {
    public void Capture() {
        Texture2D tex = new Texture2D(Screen.width, Screen.height);
        tex.ReadPixels(new Rect(0, 0, Screen.width, Screen.height), 0, 0);
        tex.Apply();
        // ... 이미지 처리
    }
}`,
      options: [
        { id: "A", text: "Texture2D는 가비지 컬렉션되지 않음", isCause: false },
        { id: "B", text: "Destroy()를 호출하지 않음", isCause: true },
        { id: "C", text: "new Texture2D가 너무 큼", isCause: false },
        { id: "D", text: "Destroy(tex) 호출", isCause: false },
        { id: "E", text: "tex = null 할당", isCause: false },
        { id: "F", text: "using 문 사용", isCause: false },
      ],
      correctCause: "B",
      correctSolution: "D",
      explanation: "Unity의 Texture2D는 네이티브 메모리를 사용하므로 가비지 컬렉터가 자동으로 해제하지 않습니다. 사용이 끝난 후 반드시 Destroy()를 호출해야 메모리 누수를 방지할 수 있습니다.",
      hint: "Unity Object는 Destroy()로 명시적으로 파괴해야 합니다.",
    },
    {
      title: "Object Pool 충돌",
      description: "풀링된 총알이 예상치 못한 충돌을 일으킵니다.",
      codeSnippet: `public void ReturnToPool(GameObject obj) {
    obj.SetActive(false);
    pool.Enqueue(obj);
}

public GameObject GetFromPool() {
    if (pool.Count > 0) {
        GameObject obj = pool.Dequeue();
        obj.SetActive(true);
        return obj;
    }
    return CreateNew();
}`,
      options: [
        { id: "A", text: "SetActive(false) 후 물리가 즉시 중지되지 않음", isCause: true },
        { id: "B", text: "Enqueue/Dequeue 순서가 잘못됨", isCause: false },
        { id: "C", text: "pool 크기가 너무 작음", isCause: false },
        { id: "D", text: "풀에서 꺼낼 때 위치/속도 리셋", isCause: false },
        { id: "E", text: "Coroutine으로 1프레임 대기 후 활성화", isCause: false },
        { id: "F", text: "Physics.SyncTransforms() 호출", isCause: false },
      ],
      correctCause: "A",
      correctSolution: "D",
      explanation: "SetActive(false)로 비활성화핏 Rigidbody의 속도와 위치는 유지됩니다. 풀에서 꺼낼 때 transform.position/rotation을 리셋하고 velocity를 Zero로 설정해야 예상치 못한 충돌을 방지할 수 있습니다.",
      hint: "풀링된 객체는 재사용 시 상태를 완전히 초기화해야 합니다.",
    },
    {
      title: "Async 로딩 중 씬 전환",
      description: "SceneManager.LoadSceneAsync 사용 중 예외가 발생합니다.",
      codeSnippet: `async void LoadLevel(string sceneName) {
    var op = SceneManager.LoadSceneAsync(sceneName);
    while (!op.isDone) {
        progressBar.value = op.progress;
    }
}`,
      options: [
        { id: "A", text: "async void는 예외를 잡을 수 없음", isCause: true },
        { id: "B", text: "op.progress가 0.9에서 멈춤", isCause: false },
        { id: "C", text: "while 루프가 프레임을 블록함", isCause: false },
        { id: "D", text: "async Task로 변경하고 await 사용", isCause: false },
        { id: "E", text: "op.allowSceneActivation = false 사용", isCause: false },
        { id: "F", text: "yield return null 사용", isCause: false },
      ],
      correctCause: "A",
      correctSolution: "D",
      explanation: "async void는 이벤트 핸들러용이며, 발생한 예외를 호출자가 잡을 수 없습니다. 또한 while 루프에서 await가 없으면 프레임이 블록됩니다. async Task로 변경하고 await op;를 사용하거나, Coroutine 방식을 사용해야 합니다.",
      hint: "Unity에서는 async void 대신 async Task나 Coroutine을 사용하세요.",
    },
  ],
  Expert: [
    {
      title: "ECS Burst Compiler 오류",
      description: "Job System 사용 중 메모리 액세스 위반 오류가 발생합니다.",
      codeSnippet: `[BurstCompile]
struct MoveJob : IJobParallelForTransform {
    public NativeArray<Vector3> positions;
    public float deltaTime;
    
    public void Execute(int index, TransformAccess transform) {
        transform.position += positions[index] * deltaTime;
    }
}`,
      options: [
        { id: "A", text: "NativeArray가 Job 완료 전에 해제됨", isCause: true },
        { id: "B", text: "BurstCompile이 잘못된 구조체에 붙음", isCause: false },
        { id: "C", text: "IJobParallelForTransform는 Burst 미지원", isCause: false },
        { id: "D", text: "JobHandle.Complete() 후 NativeArray 해제", isCause: false },
        { id: "E", text: "[NativeDisableParallelForRestriction] 사용", isCause: false },
        { id: "F", text: "NativeArray를 [ReadOnly]로 마킹", isCause: false },
      ],
      correctCause: "A",
      correctSolution: "D",
      explanation: "Job는 비동기로 실행되므로, NativeArray는 Job이 완료된 후에야 해제할 수 있습니다. Schedule()이 반환한 JobHandle.Complete()를 호출하여 Job 완료를 보장한 후 NativeArray를 Dispose()해야 합니다.",
      hint: "NativeContainer는 JobHandle.Complete() 후에만 Dispose 가능합니다.",
    },
    {
      title: "Shader GPU Instancing 실패",
      description: "GPU Instancing을 활성화했지만 Draw Calls가 줄지 않습니다.",
      codeSnippet: `Shader "Custom/Instanced" {
    Properties {
        _Color ("Color", Color) = (1,1,1,1)
    }
    SubShader {
        Pass {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            // ...
            ENDCG
        }
    }
}`,
      options: [
        { id: "A", text: "#pragma multi_compile_instancing 누락", isCause: true },
        { id: "B", text: "MaterialPropertyBlock 미사용", isCause: false },
        { id: "C", text: "GPU가 Instancing을 지원하지 않음", isCause: false },
        { id: "D", text: "#pragma multi_compile_instancing 추가", isCause: false },
        { id: "E", text: "UNITY_INSTANCING_BUFFER_START 사용", isCause: false },
        { id: "F", text: "Graphics.DrawMeshInstanced 사용", isCause: false },
      ],
      correctCause: "A",
      correctSolution: "D",
      explanation: "GPU Instancing을 사용하려면 셰이더에 #pragma multi_compile_instancing 디렉티브가 필요합니다. 이것이 없으면 Unity는 instancing variant를 생성하지 않아 각 오브젝트가 개별 드로우 콜로 처리됩니다.",
      hint: "Instancing을 위해서는 셰이더에 multi_compile_instancing pragma가 필요합니다.",
    },
    {
      title: "Addressable Assets 순환 의존성",
      description: "Addressables 로드 시 무한 로딩이 발생합니다.",
      codeSnippet: `public class AssetLoader : MonoBehaviour {
    public AssetReference playerPrefab;
    
    async void Start() {
        var handle = playerPrefab.LoadAssetAsync<GameObject>();
        await handle.Task;
        Instantiate(handle.Result);
    }
}`,
      options: [
        { id: "A", text: "Addressable Group에 순환 의존성이 있음", isCause: true },
        { id: "B", text: "handle.Release()를 호출하지 않음", isCause: false },
        { id: "C", text: "AssetReference가 null임", isCause: false },
        { id: "D", text: "Addressables Groups 창에서 의존성 확인", isCause: false },
        { id: "E", text: "Circular Dependency Checker 도구 사용", isCause: false },
        { id: "F", text: "모든 Addressable을 하나의 Group으로 통합", isCause: false },
      ],
      correctCause: "A",
      correctSolution: "D",
      explanation: "Addressable Assets에서 Group A가 Group B를 참조하고, Group B가 다시 Group A를 참조하면 순환 의존성이 발생합니다. Addressables Groups 창에서 Analyze 기능으로 순환 의존성을 확인하고 제거해야 합니다.",
      hint: "Addressables Groups의 Analyze 도구로 의존성을 확인하세요.",
    },
  ],
  Master: [
    {
      title: "IL2CPP AOT 컴파일 오류",
      description: "IL2CPP 빌드에서 Generic 메서드 관련 링크 오류가 발생합니다.",
      codeSnippet: `public class Serializer {
    public string Serialize<T>(T obj) {
        return JsonUtility.ToJson(obj);
    }
    
    public T Deserialize<T>(string json) {
        return JsonUtility.FromJson<T>(json);
    }
}`,
      options: [
        { id: "A", text: "AOT에서는 Generic 인스턴스화가 제한됨", isCause: true },
        { id: "B", text: "JsonUtility는 IL2CPP를 지원하지 않음", isCause: false },
        { id: "C", text: "IL2CPP가 JSON 파싱을 못함", isCause: false },
        { id: "D", text: "link.xml에 타입 강제 포함", isCause: false },
        { id: "E", text: "[Preserve] attribute 사용", isCause: false },
        { id: "F", text: "AOT-safe JSON 라이브러리 사용", isCause: false },
      ],
      correctCause: "A",
      correctSolution: "D",
      explanation: "IL2CPP는 Ahead-of-Time 컴파일을 사용하므로, 런타임에 Generic 타입을 인스턴스화할 수 없습니다. link.xml 파일에 사용하는 Generic 타입을 명시적으로 포함시키거나, AOT-safe 직렬화 라이브러리를 사용해야 합니다.",
      hint: "IL2CPP에서는 Generic 타입이 코드에서 명시적으로 사용되지 않으면 제거됩니다.",
    },
    {
      title: "DOTS Burst Safety System 위반",
      description: "Burst compiled job에서 safety check 오류가 발생합니다.",
      codeSnippet: `[BurstCompile]
struct ProcessJob : IJob {
    public NativeArray<int> data;
    public NativeReference<int> result;
    
    public void Execute() {
        for (int i = 0; i < data.Length; i++) {
            result.Value += data[i];
        }
    }
}`,
      options: [
        { id: "A", text: "NativeReference는 thread-safe하지 않음", isCause: true },
        { id: "B", text: "for 루프가 Burst에서 최적화 안됨", isCause: false },
        { id: "C", text: "NativeArray를 [ReadOnly]로 해야 함", isCause: false },
        { id: "D", text: "NativeArray<int>로 합계 계산 후 할당", isCause: false },
        { id: "E", text: "[NativeDisableUnsafePtrRestriction] 사용", isCause: false },
        { id: "F", text: "IJobParallelFor로 변경", isCause: false },
      ],
      correctCause: "A",
      correctSolution: "D",
      explanation: "NativeReference는 thread-safe하지 않아 parallel job에서 동시 액세스 시 race condition이 발생합니다. NativeArray로 로컬 합계를 계산한 후 최종 결과를 합치거나, Interlocked.Add 같은 atomic 연산을 사용해야 합니다.",
      hint: "Parallel job에서는 thread-safe한 방식으로 결과를 집계해야 합니다.",
    },
    {
      title: "Custom SRP 메모리 대역폭 병목",
      description: "Custom Scriptable Render Pipeline에서 프레임 시간이 예상보다 높습니다.",
      codeSnippet: `void Render(RenderGraph renderGraph, ContextContainer frameData) {
    using (var builder = renderGraph.AddRasterRenderPass<PassData>(...)) {
        builder.UseTexture(sourceTexture);
        builder.SetRenderFunc((data, ctx) => {
            // Full-screen blur 구현
            for (int i = 0; i < 8; i++) {
                ctx.cmd.Blit(data.source, data.destination);
            }
        });
    }
}`,
      options: [
        { id: "A", text: "여러 Blit 호출로 메모리 대역폭 과다 사용", isCause: true },
        { id: "B", text: "RenderGraph가 GPU를 효율적으로 사용 못함", isCause: false },
        { id: "C", text: "RasterRenderPass가 느림", isCause: false },
        { id: "D", text: "Compute Shader로 Blit 통합", isCause: false },
        { id: "E", text: " downsampling으로 중간 텍스처 생성", isCause: false },
        { id: "F", text: "RenderTexture.GetTemporary 사용", isCause: false },
      ],
      correctCause: "A",
      correctSolution: "D",
      explanation: "여러 번의 fullscreen Blit은 매우 높은 메모리 대역폭을 사용합니다. Gaussian blur 등을 Compute Shader로 구현하여 여러 패스를 하나로 통합하거나, bilateral filter 등을 사용하여 샘플링을 줄여야 합니다.",
      hint: "Fullscreen Blit은 메모리 대역폭을 많이 사용하므로 최소화해야 합니다.",
    },
  ],
}

// ============================================================================
// Seed Functions
// ============================================================================

/**
 * 테스트 사용자 생성
 * 참고: Better Auth는 별도의 인증 테이블을 사용하므로,
 * 로그인 테스트를 위해서는 Better Auth API를 통해 회원가입을 수행해야 합니다.
 */
async function createTestUser() {
  console.log("📝 Creating test user...")

  // 기존 사용자 확인
  const existingUser = await prisma.user.findUnique({
    where: { email: TEST_USER.email },
  })

  if (existingUser) {
    console.log(`   ℹ️ Test user already exists: ${existingUser.id}`)
    return existingUser
  }

  // Better Auth는 자체 테이블 구조를 사용하므로, Prisma로 직접 생성
  // 참고: 실제 Better Auth 사용 시에는 API를 통해 생성하는 것이 권장됨
  const user = await prisma.user.create({
    data: {
      email: TEST_USER.email,
      name: TEST_USER.name,
      level: TEST_USER.level,
      streak: 5,
    },
  })

  console.log(`   ✅ Test user created: ${user.id}`)
  return user
}

/**
 * 카테고리 생성
 */
async function createCategories() {
  console.log("📂 Creating categories...")

  const categories = []
  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i]
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        orderIndex: i,
      },
    })
    categories.push(category)
    console.log(`   ✅ Category: ${category.name}`)
  }

  return categories
}

/**
 * 퀴즈 생성
 */
async function createQuizzes(categories: Array<{ id: string; name: string }>) {
  console.log("🧩 Creating quizzes...")

  const quizzes = []
  let quizIndex = 0

  for (const [userLevel, quizList] of Object.entries(QUIZZES_BY_LEVEL)) {
    const quizLevel = LEVEL_MAPPING[userLevel]
    
    for (let i = 0; i < quizList.length; i++) {
      const quizData = quizList[i]
      // 카테고리 순환分配
      const category = categories[quizIndex % categories.length]

      const quiz = await prisma.quiz.create({
        data: {
          categoryId: category.id,
          level: quizLevel,
          title: `[${userLevel}] ${quizData.title}`,
          description: quizData.description,
          codeSnippet: quizData.codeSnippet,
          options: quizData.options,
          correctCause: quizData.correctCause,
          correctSolution: quizData.correctSolution,
          explanation: quizData.explanation,
          hint: quizData.hint,
          tags: [category.name.toLowerCase(), userLevel.toLowerCase()],
          isActive: true,
        },
      })

      quizzes.push(quiz)
      console.log(`   ✅ Quiz [${userLevel}]: ${quizData.title}`)
      quizIndex++
    }
  }

  return quizzes
}

/**
 * 사용자 진도 생성
 */
async function createUserProgress(userId: string) {
  console.log("📊 Creating user progress...")

  const progress = await prisma.userProgress.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      currentLevel: UserLevel.Intermediate,
      totalAttempts: 10,
      correctCount: 7,
      accuracy: 70.0,
      streakDays: 5,
      lastAttemptDate: new Date(),
      weeklyGoal: 10,
      categoryProgress: {
        [CATEGORIES[0].name]: { attempts: 3, correct: 2, completed: [] },
        [CATEGORIES[1].name]: { attempts: 2, correct: 2, completed: [] },
        [CATEGORIES[2].name]: { attempts: 3, correct: 2, completed: [] },
        [CATEGORIES[3].name]: { attempts: 1, correct: 0, completed: [] },
        [CATEGORIES[4].name]: { attempts: 1, correct: 1, completed: [] },
      },
    },
  })

  console.log(`   ✅ User progress created: ${progress.id}`)
  return progress
}

/**
 * QuizAttempt 생성 (히스토리)
 */
async function createQuizAttempts(
  userId: string,
  quizzes: Array<{ id: string; correctCause: string; correctSolution: string }>
) {
  console.log("🎯 Creating quiz attempts...")

  // 일부 퀴즈에 대해 시도 기록 생성
  const attempts = []
  const selectedQuizzes = quizzes.slice(0, 10) // 처음 10개 퀴즈에 대해

  for (let i = 0; i < selectedQuizzes.length; i++) {
    const quiz = selectedQuizzes[i]
    // 7개는 정답, 3개는 오답
    const isCorrect = i < 7
    
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId: quiz.id,
        selectedCause: isCorrect ? quiz.correctCause : "B",
        selectedSolution: isCorrect ? quiz.correctSolution : "C",
        isCorrect,
        causeCorrect: isCorrect,
        solutionCorrect: isCorrect,
        timeSpentSeconds: 15 + Math.floor(Math.random() * 45),
        attemptDate: new Date(Date.now() - i * 86400000), // 과거 날짜로 분산
      },
    })

    // 퀴즈 통계 업데이트
    await prisma.quiz.update({
      where: { id: quiz.id },
      data: {
        totalAttempts: { increment: 1 },
        correctAttempts: { increment: isCorrect ? 1 : 0 },
      },
    })

    attempts.push(attempt)
  }

  console.log(`   ✅ Created ${attempts.length} quiz attempts`)
  return attempts
}

// ============================================================================
// Main Seed Function
// ============================================================================

async function main() {
  console.log("\n🌱 Starting database seed...\n")

  try {
    // 1. 테스트 사용자 생성
    const user = await createTestUser()

    // 2. 카테고리 생성
    const categories = await createCategories()

    // 3. 퀴즈 생성
    const quizzes = await createQuizzes(categories)

    // 4. 사용자 진도 생성
    await createUserProgress(user.id)

    // 5. 퀴즈 시도 기록 생성
    await createQuizAttempts(user.id, quizzes)

    console.log("\n✨ Database seed completed successfully!\n")
    console.log("📋 Summary:")
    console.log(`   • User: ${user.email} (${user.id})`)
    console.log(`   • Categories: ${categories.length}`)
    console.log(`   • Quizzes: ${quizzes.length}`)
    console.log(`   • Level: ${TEST_USER.level}`)
    console.log(`   • Progress: 10 attempts, 70% accuracy`)
    console.log("")
    console.log("🔑 Test Credentials:")
    console.log(`   Email: ${TEST_USER.email}`)
    console.log(`   Password: ${TEST_USER.password}`)
    console.log("")

  } catch (error) {
    console.error("\n❌ Seed failed:", error)
    throw error
  }
}

// ============================================================================
// Execute
// ============================================================================

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
