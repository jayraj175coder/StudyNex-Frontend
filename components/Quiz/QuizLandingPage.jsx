"use client";
import React, { useState } from "react";
import Quiz from "./Quiz";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { loginApi, submitQuiz } from "../Constants/apiEndpoints";
import { postRequest } from "@/config/axiosInterceptor";
import { getCookie } from "cookies-next";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { activeOrgChannel } from "@/store/activeOrgChannel";

const QuizLandingPage = ({ quiz, quizData }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [points, setPoints] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [answers, setAnswers] = useState([]);
  const params = useParams();
  const router = useRouter();
  const [newQuiz, setNewQuiz] = useState(
    quiz.map((question) => ({
      ...question,
      userAnswer: null,
    }))
  );
  const urlParams = new URLSearchParams(window.location.search);
  const setOrgActiveChannel = activeOrgChannel((state) => state.setOrgChannel);

  const handleNext = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
    if (currentQuestionIndex == newQuiz.length - 1) {
      setLoading(true);
      try {
        const response = postRequest({
          url: submitQuiz,
          body: {
            quiz_id: params.id,
            answers: JSON.stringify(answers),
            points: points,
          },
          token: getCookie("token"),
        });
        const res = response;
        setLoading(false);
        if (urlParams.get("org")) {
          setOrgActiveChannel("Assessments");
          router.push("/");
        } else {
          router.push(
            `/quiz?channel_id=${urlParams.get(
              "channel_id"
            )}&org_id=${urlParams.get("org_id")}`
          );
        }
      } catch (error) {
        toast.error("Something went wrong!!");
        console.log(error);
        setLoading(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswer = (userAnswer) => {
    const updatedQuiz = [...newQuiz];
    updatedQuiz[currentQuestionIndex].userAnswer = userAnswer;
    setNewQuiz(updatedQuiz);
    if (userAnswer === updatedQuiz[currentQuestionIndex].answer) {
      setPoints(points + 1);
    }
    setAnswers((prev) => [...prev, userAnswer]);
  };

  return (
    <div>
      {/* loader */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex justify-center items-center h-full">
          <div class="loader"></div>
        </div>
      )}

      {/* quiz */}
      <div className="bg-white rounded-lg pb-4 h-screen">
        <div className="grid md:grid-cols-[156px,1fr,156px] h-full place-content-center md:gap-8 py-5 max-w-maxContainer mx-auto">
          <div></div>
          {/* quiz */}
          <div className="bg-white rounded-lg border border-gray-200">
            {/* title */}
            <div className="px-10 pt-8 text-center">
              <p className="text-lg font-bold py-4">{quizData.title}</p>
            </div>

            {/* question */}
            <Quiz
              question={newQuiz[currentQuestionIndex]}
              index={currentQuestionIndex + 1}
              handleAnswer={handleAnswer}
            />

            {/* button */}
            <div className="px-10 pb-8 w-full flex justify-between">
              <button
                onClick={handlePrevious}
                className={`text-white flex justify-center px-4 py-2 rounded-md ${
                  currentQuestionIndex == 0
                    ? "invisible"
                    : "gradient-transition"
                }`}
              >
                <p className={`text-lg flex items-center gap-4`}>
                  <ChevronLeft /> Previous{" "}
                </p>
              </button>
              <button
                onClick={handleNext}
                className="gradient-transition text-white flex justify-center px-4 py-2 rounded-md"
              >
                {currentQuestionIndex == newQuiz.length - 1 ? (
                  <p className="text-lg flex items-center gap-4">Finish</p>
                ) : (
                  <p className="text-lg flex items-center gap-4">
                    Next <ChevronRight />{" "}
                  </p>
                )}
              </button>
            </div>
          </div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default QuizLandingPage;
