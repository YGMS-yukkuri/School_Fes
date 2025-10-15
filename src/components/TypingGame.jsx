// TypingGame.jsx
import { useState, useEffect } from "react";
import { kanaToRomajiMap } from "../utils/kanaToRomaji";
import { db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";

export default function TypingGame() {
    const [target, setTarget] = useState("こんにちは");
    const [input, setInput] = useState("");
    const [romajiProgress, setRomajiProgress] = useState("");
    const [score, setScore] = useState(0);

    const targetRomaji = target.split("").map(k => kanaToRomajiMap[k] || [k]);

    // 入力が有効かチェックし、完了したかも判定
    const checkInput = (inputStr) => {
        // すべての可能なローマ字の組み合わせを生成
        const generatePossibleRomaji = (romajiArray, index = 0, current = "") => {
            if (index >= romajiArray.length) {
                return [current];
            }
            const results = [];
            for (const option of romajiArray[index]) {
                results.push(...generatePossibleRomaji(romajiArray, index + 1, current + option));
            }
            return results;
        };

        const possibleRomaji = generatePossibleRomaji(targetRomaji);
        
        // 入力が有効な途中経過かチェック
        const isValid = possibleRomaji.some(r => r.startsWith(inputStr));
        // 完了したかチェック
        const isComplete = possibleRomaji.some(r => r === inputStr);
        
        return { isValid, isComplete };
    };

    useEffect(() => {
        const handleKey = (e) => {
            // 特殊キーを無視
            if (e.key.length > 1) return;
            
            const newInput = input + e.key.toLowerCase();
            const { isValid, isComplete } = checkInput(newInput);

            if (isValid) {
                setInput(newInput);
                setRomajiProgress(newInput);
                
                if (isComplete) {
                    setScore(prev => prev + 10);
                    uploadScore();
                    nextWord();
                }
            } else {
                setInput("");
                setRomajiProgress("");
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [input, target]);

    const uploadScore = async () => {
        await addDoc(collection(db, "rankings"), { name: "Player", score, time: new Date().toISOString() });
    };

    const nextWord = () => {
        setTarget("ありがとう"); // 仮
        setInput("");
    };

    return (
        <div>
            <h1>{target}</h1>
            <p>{romajiProgress}</p>
            <p>Score: {score}</p>
        </div>
    );
}
