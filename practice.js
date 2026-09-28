const circleArea = (radius) => 3.14 * radius * radius;

const getGrade = (score) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    return "F";
}

const introduce = (name, age, job = "무직") =>
  `${name}님은${age}세이며 직업은 ${job}입니다.`;

console.log(circleArea(5));                    // 78.5
console.log(getGrade(85));                     // B
console.log(introduce("철수", 25, "개발자"));
console.log(introduce("영희", 30));