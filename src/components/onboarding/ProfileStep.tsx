"use client";

import { useState, useEffect } from "react";
import { User, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ProfileStepProps {
  defaultNickname: string;
  onNext: (nickname: string) => void;
  onSkip?: () => void;
}

export function ProfileStep({
  defaultNickname,
  onNext,
  onSkip,
}: ProfileStepProps) {
  const [nickname, setNickname] = useState(defaultNickname);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string>("");

  // 닉네임 유효성 검사
  const validateNickname = (value: string): boolean => {
    if (value.length < 2) {
      setError("닉네임은 최소 2자 이상이어야 합니다.");
      return false;
    }
    if (value.length > 20) {
      setError("닉네임은 최대 20자까지 가능합니다.");
      return false;
    }
    if (!/^[a-zA-Z0-9가-힣_]+$/.test(value)) {
      setError("닉네임은 한글, 영문, 숫자, 언더스코어(_)만 사용 가능합니다.");
      return false;
    }
    setError("");
    return true;
  };

  // 중복 확인 (mock)
  const checkDuplicate = async (value: string) => {
    if (!validateNickname(value)) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    // 실제로는 API 호출
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Mock: "test" 라는 닉네임은 중복으로 처리
    const isDup = value.toLowerCase() === "test";
    setIsAvailable(!isDup);
    if (isDup) {
      setError("이미 사용 중인 닉네임입니다.");
    }
    setIsChecking(false);
  };

  // 디바운스를 위한 타이머
  useEffect(() => {
    const timer = setTimeout(() => {
      if (nickname.length >= 2) {
        checkDuplicate(nickname);
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nickname]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateNickname(nickname) && isAvailable !== false) {
      onNext(nickname);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          반갑습니다! 👋
        </h2>
        <p className="text-gray-600">
          UnityLearn에서 사용할 닉네임을 설정해주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nickname" className="text-sm font-medium">
            닉네임
            <span className="text-red-500 ml-1">*</span>
          </Label>
          
          <div className="relative">
            <Input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setIsAvailable(null);
                if (e.target.value.length >= 2) {
                  validateNickname(e.target.value);
                } else {
                  setError("");
                }
              }}
              placeholder="닉네임을 입력하세요"
              className={cn(
                "h-12 text-lg pr-10",
                isAvailable === true && "border-green-500 focus-visible:ring-green-500",
                isAvailable === false && "border-red-500 focus-visible:ring-red-500",
                error && "border-red-500"
              )}
              maxLength={20}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isChecking ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              ) : isAvailable === true ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : isAvailable === false ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : null}
            </div>
          </div>

          {/* Validation messages */}
          <div className="flex items-center justify-between text-xs">
            <span
              className={cn(
                "transition-colors",
                nickname.length > 20 ? "text-red-500" : "text-gray-400"
              )}
            >
              {nickname.length}/20자
            </span>
            {isAvailable === true && (
              <span className="text-green-600">사용 가능한 닉네임입니다</span>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>

        <div className="pt-4 space-y-3">
          <Button
            type="submit"
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={!isAvailable || isChecking}
          >
            다음
          </Button>

          {onSkip && (
            <Button
              type="button"
              variant="ghost"
              onClick={onSkip}
              className="w-full text-gray-500"
            >
              건 바뛰기
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
