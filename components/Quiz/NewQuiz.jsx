import { ArrowLeft, Upload } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { Pdf } from "../Constants/imageContants";
import Quiz from "./Quiz";
import toast from "react-hot-toast";
import axios from "axios";
import { postRequest } from "@/config/axiosInterceptor";
import { createNewQuizApi } from "../Constants/apiEndpoints";
import { useParams } from "next/navigation";
import { getCookie } from "cookies-next";
import { useLoader } from "@/store/loaderStore";

const NewQuiz = ({ setCreatePage }) => {
  const [quiz, setQuiz] = useState(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const generateQuiz = () => {
    if(!title) {
      toast.error("Please enter a title");
      return;
    };
    if(!file) {
      toast.error("Please select a file")
      return;
    };
    try {
      const formData = new FormData();
      formData.append("file", file);

      axios
        .post("https://quizcreation.onrender.com/generate_quiz", formData)
        .then((response) => setQuiz(response.data.quiz))
        .catch((error) => console.error("Error:", error));
    } catch (error) {
      toast.error("Something went wrong!!");
    }
  };
  return (
    <>
      {!quiz ? (
        <>
          <button
            onClick={() => setCreatePage(false)}
            className="bg-blue-500 text-white rounded-md px-4 py-2  w-fit flex gap-2"
          >
            <ArrowLeft />
            Back
          </button>
          <p className="font-bold">Add new quiz</p>
          <div>
            <div className="h-14 w-full flex flex-col gap-2">
              <p>Enter Quiz title</p>
              <input
                className="h-full w-full border px-5  py-3 rounded-md "
                id="roomId"
                type="text"
                required={true}
                placeholder="Quiz Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>
          <div className="relative cursor-pointer w-full h-1/2 border-2 border-gray-400 rounded-md border-dashed flex flex-col justify-center items-center gap-3">
            <p className="p-4 bg-blue-500 text-white rounded-full">
              <Upload size={30} />
            </p>
            <p className="text-lg text-center">
              Drag & Drop or <span className="text-blue-500">Choose file</span>{" "}
              to create Quiz{" "}
            </p>
            <p className="text-sm text-gray-500 text-center">
              Supported formats : .pdf, .ppt
            </p>
            <input
              type="file"
              id="file"
              accept="application/pdf"
              className="opacity-0 text-[0.4rem] absolute cursor-pointer w-full h-full"
              onChange={handleFileChange}
            />
          </div>
          {file && (
            <div className="border px-4 py-3 rounded-md flex gap-3">
              <Image src={Pdf} alt="" className="w-10"></Image>
              <div>
                <p>{file.name}</p>
                <p className="text-gray-400">
                  {file?.size ? (file?.size / 1048576).toFixed(2) + "MB" : ""}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={generateQuiz}
            className="bg-blue-500 text-white rounded-md px-4 py-2 transition duration-200 w-fit self-end"
          >
            Create new Quiz
          </button>
        </>
      ) : (
        <DisplayQuiz quiz={quiz} title={title} setQuiz={setQuiz} />
      )}
    </>
  );
};

export default NewQuiz;

const DisplayQuiz = ({ quiz, title, setQuiz }) => {
  const [isLoading, setLoading] = useState(false);
  const params = useParams();
  const urlParams = new URLSearchParams(window.location.search);

  const createQuiz = async () => {
    try {
      setLoading(true);
      const response = await postRequest({
        url: createNewQuizApi,
        body: {
          title: title,
          quiz: JSON.stringify(quiz),
          channel_id: urlParams.get("channel_id"),
          org_id: urlParams.get("org_id"),
        },
        token: getCookie("token"),
      });
      const res = response.data.data;
      if (response.status) {
        window.location.reload();
      }
    } catch (error) {
      toast.error("Something went wrong!!");
      setLoading(false);
      console.log(error);
    }
  };
  return (
    <div className="h-full w-full">
      <div className="flex flex-col gap-3">
        <button
          onClick={() => setQuiz(null)}
          className="bg-blue-500 text-white rounded-md px-4 py-2  w-fit flex gap-2"
        >
          <ArrowLeft />
          Back
        </button>
        <p className="font-bold">Quiz title : {title}</p>
      </div>

      {quiz &&
        quiz.map((quiz, index) => (
          <Quiz key={index} question={quiz} listing={true} />
        ))}
      <div className="w-full flex justify-end lg:px-10 px-2">
        <button
          onClick={createQuiz}
          className="bg-blue-500 text-white rounded-md px-4 py-2 mb-6 hover:scale-105 transition duration-200 w-fit self-end"
        >
          Create new Quiz
        </button>
      </div>
      {/* loader */}
      {isLoading && (
        <div className="absolute flex justify-center items-center inset-0 bg-black bg-opacity-75">
          <div class="loader"></div>
        </div>
      )}
    </div>
  );
};
