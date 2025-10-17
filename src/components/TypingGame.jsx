// TypingGame.jsx
import { useState, useEffect } from "react";
import { kanaToRomajiMap } from "../utils/kanaToRomaji";
import { TypingIndex } from "../utils/TypingIndex";
import { db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";

export default function TypingGame() {
    const [targetIndex, setTargetIndex] = useState(0);
    const [target, setTarget] = useState(TypingIndex[targetIndex].word);

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
                    // 次の単語へは index を更新するだけにする
                    setTargetIndex(prev => prev + 1);
                }
            } else {
                setInput("");
                setRomajiProgress("");
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [input, targetRomaji, targetIndex]);

    // targetIndex が増えたら target を更新して入力をリセットする
    useEffect(() => {
        if (targetIndex >= TypingIndex.length) {
            // 範囲外になったら先頭に戻す
            setTargetIndex(0);
            setTarget(TypingIndex[0].word);
        } else {
            setTarget(TypingIndex[targetIndex].word);
        }
        setInput("");
        setRomajiProgress("");
    }, [targetIndex]);

    const nextWord = () => {
        setTargetIndex(prev => prev + 1);
    };

    return (
        <div>
            <h1>{target}</h1>
            <p>{romajiProgress}</p>
            <p>Score: {score}</p>
        </div>
    );
}
