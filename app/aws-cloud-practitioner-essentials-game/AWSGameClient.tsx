"use client";

import { useMemo, useState } from "react";

const questions = [
  {
    question: "What does AWS stand for?",
    options: ["Amazon Web Services", "Amazon Web Solutions", "Advanced Web Services", "Application Web System"],
    correct: "Amazon Web Services",
  },
  {
    question: "Which AWS service provides scalable object storage?",
    options: ["Amazon S3", "Amazon RDS", "Amazon EC2", "Amazon VPC"],
    correct: "Amazon S3",
  },
  {
    question: "Which AWS service is used to manage users and permissions?",
    options: ["AWS IAM", "Amazon CloudWatch", "Amazon SNS", "Amazon EBS"],
    correct: "AWS IAM",
  },
  {
    question: "Which AWS service allows you to run virtual machines in the cloud?",
    options: ["Amazon EC2", "Amazon Lambda", "Amazon S3", "Amazon DynamoDB"],
    correct: "Amazon EC2",
  },
  {
    question: "What pricing model does AWS primarily use?",
    options: ["Pay-as-you-go pricing model", "Subscription pricing model", "Licensing pricing model", "Fixed monthly pricing"],
    correct: "Pay-as-you-go pricing model",
  },
  {
    question: "What is an AWS service that is purpose-built for storing objects with high durability?",
    options: ["Amazon S3", "Amazon RDS", "Amazon EC2", "Amazon VPC"],
    correct: "Amazon S3",
  },
  {
    question: "What is the AWS service that provides a Virtual Private Cloud for launching AWS resources?",
    options: ["Amazon VPC", "AWS Shield", "Amazon CloudFront", "Amazon Route 53"],
    correct: "Amazon VPC",
  },
  {
    question: "What is the AWS pricing model that allows you to pay only for what you consume?",
    options: ["Pay-as-you-go pricing", "Reserved pricing", "Spot pricing", "Fixed pricing"],
    correct: "Pay-as-you-go pricing",
  },
  {
    question: "What is the AWS service that protects from Distributed Denial-of-Service attacks?",
    options: ["AWS Shield", "Amazon GuardDuty", "AWS WAF", "AWS CloudTrail"],
    correct: "AWS Shield",
  },
  {
    question: "What is an AWS service that provides a low-cost method for backing up and archiving data?",
    options: ["Amazon S3 Glacier", "Amazon S3 Standard", "Amazon EFS", "Amazon EBS"],
    correct: "Amazon S3 Glacier",
  },
  {
    question: "What is the AWS service that automatically deploys applications?",
    options: ["AWS Elastic Beanstalk", "AWS CodeDeploy", "Amazon ECS", "Amazon EC2"],
    correct: "AWS Elastic Beanstalk",
  },
  {
    question: "What is the AWS service that provides Single Sign-On and Identity Federation functionality?",
    options: ["AWS IAM Identity Center (AWS SSO)", "AWS Cognito", "AWS Directory Service", "AWS Shield"],
    correct: "AWS IAM Identity Center (AWS SSO)",
  },
  {
    question: "What is the AWS service that provides scalable NoSQL database capability?",
    options: ["Amazon DynamoDB", "Amazon RDS", "Amazon Redshift", "Amazon Aurora"],
    correct: "Amazon DynamoDB",
  },
  {
    question: "What is the primary benefit of using AWS Availability Zones?",
    options: ["Increased fault tolerance and high availability", "Lower latency for data transfer", "Cheaper storage costs", "Easier database migrations"],
    correct: "Increased fault tolerance and high availability",
  },
  {
    question: "What is the AWS service used for load balancing?",
    options: ["Elastic Load Balancing (ELB)", "AWS Batch", "Amazon CloudFront", "AWS Lambda"],
    correct: "Elastic Load Balancing (ELB)",
  },
  {
    question: "What is the purpose of AWS Cloud Computing?",
    options: ["To give access to IT resources on a pay-per-use basis through the internet", "To manage desktop applications locally", "To host only static websites", "To provide free server access"],
    correct: "To give access to IT resources on a pay-per-use basis through the internet",
  },
  {
    question: "Which service is used to monitor and log your resources?",
    options: ["Amazon CloudWatch", "AWS Config", "AWS CloudTrail", "Amazon Inspector"],
    correct: "Amazon CloudWatch",
  },
  {
    question: "What is an AWS Region?",
    options: ["A physical location around the world that contains multiple data centers", "A single data center in one location", "A logical group of services", "A user account boundary"],
    correct: "A physical location around the world that contains multiple data centers",
  },
  {
    question: "What service is used for a relational database?",
    options: ["Amazon RDS", "Amazon DynamoDB", "Amazon Redshift", "Amazon Aurora"],
    correct: "Amazon RDS",
  },
  {
    question: "What are the benefits of using multiple AWS regions?",
    options: ["Increased reliability and improved backup and recovery", "Faster local compute only", "Lower per-instance billing", "Free data transfer between zones"],
    correct: "Increased reliability and improved backup and recovery",
  },
  {
    question: "What service is used for content delivery and caching?",
    options: ["Amazon CloudFront", "AWS AppSync", "Amazon SQS", "AWS Amplify"],
    correct: "Amazon CloudFront",
  },
  {
    question: "What does an Availability Zone represent?",
    options: ["One or more data centers within a region", "A single server rack", "A logical network segment", "A group of AWS accounts"],
    correct: "One or more data centers within a region",
  },
  {
    question: "Which service is used to analyze security and performance issues?",
    options: ["AWS Trusted Advisor", "AWS CloudTrail", "AWS Config", "Amazon Inspector"],
    correct: "AWS Trusted Advisor",
  },
  {
    question: "What is the purpose of AWS VPC?",
    options: ["To create a virtual private cloud inside AWS", "To store files in the cloud", "To manage billing and costs", "To monitor application logs"],
    correct: "To create a virtual private cloud inside AWS",
  },
  {
    question: "Which service provides secure remote access to AWS resources?",
    options: ["AWS VPN", "Amazon Lightsail", "AWS WAF", "Amazon WorkSpaces"],
    correct: "AWS VPN",
  },
  {
    question: "What AWS service is for managing your DNS?",
    options: ["Amazon Route 53", "AWS CloudMap", "Amazon VPC", "AWS Directory Service"],
    correct: "Amazon Route 53",
  },
  {
    question: "Which AWS service allows you to run code without servers?",
    options: ["AWS Lambda", "Amazon EC2", "Amazon ECS", "AWS Elastic Beanstalk"],
    correct: "AWS Lambda",
  },
  {
    question: "What does Amazon EC2 Auto Scaling do?",
    options: ["Automatically adjusts the number of EC2 instances based on traffic", "Creates a virtual private cloud", "Monitors database performance", "Distributes traffic to CDN endpoints"],
    correct: "Automatically adjusts the number of EC2 instances based on traffic",
  },
  {
    question: "What AWS service allows you to run a Kubernetes cluster?",
    options: ["Amazon EKS", "Amazon ECS", "Amazon ECR", "AWS Fargate"],
    correct: "Amazon EKS",
  },
  {
    question: "What AWS service can be used to store data in a warehouse?",
    options: ["Amazon Redshift", "Amazon Neptune", "Amazon DynamoDB", "Amazon RDS"],
    correct: "Amazon Redshift",
  },
  {
    question: "What does AWS CloudTrail do?",
    options: ["Tracks and logs user activity and API usage", "Provides real-time metrics", "Encrypts data at rest", "Delivers content globally"],
    correct: "Tracks and logs user activity and API usage",
  },
  {
    question: "Which AWS service can you use to create infrastructure as code?",
    options: ["AWS CloudFormation", "AWS Config", "AWS OpsWorks", "AWS CodeBuild"],
    correct: "AWS CloudFormation",
  },
  {
    question: "Which AWS service assists with load balancing?",
    options: ["Elastic Load Balancer", "AWS Batch", "AWS CodeDeploy", "AWS Control Tower"],
    correct: "Elastic Load Balancer",
  },
  {
    question: "Which AWS service is used for sending messages between systems?",
    options: ["Amazon SQS", "Amazon SNS", "AWS Step Functions", "Amazon MQ"],
    correct: "Amazon SQS",
  },
  {
    question: "What AWS service can be used to stream data in real-time?",
    options: ["Amazon Kinesis", "Amazon S3", "Amazon EMR", "AWS Glue"],
    correct: "Amazon Kinesis",
  },
  {
    question: "Which service does AWS base their managed container application offerings on?",
    options: ["Amazon ECS", "Amazon EKS", "AWS Fargate", "AWS Lambda"],
    correct: "Amazon ECS",
  },
  {
    question: "What service does AWS use for cost management and billing analysis?",
    options: ["AWS Cost Explorer", "AWS Budgets", "AWS Pricing Calculator", "AWS Trusted Advisor"],
    correct: "AWS Cost Explorer",
  },
  {
    question: "How does AWS Organizations help manage accounts?",
    options: ["It enables centralized management of multiple AWS accounts", "It automates code deployments", "It stores log data", "It provides object storage"],
    correct: "It enables centralized management of multiple AWS accounts",
  },
  {
    question: "What service enables compliance auditing in AWS?",
    options: ["AWS Artifact", "AWS Config", "AWS Shield", "AWS CloudTrail"],
    correct: "AWS Artifact",
  },
  {
    question: "What type of cloud model is AWS?",
    options: ["Public Cloud", "Private Cloud", "Hybrid Cloud", "Community Cloud"],
    correct: "Public Cloud",
  },
  {
    question: "What service is used to monitor applications and tracing?",
    options: ["AWS X-Ray", "Amazon CloudWatch", "AWS CloudTrail", "AWS CodeGuru"],
    correct: "AWS X-Ray",
  },
  {
    question: "How does AWS provide elasticity?",
    options: ["By automatically scaling resources based on demand", "By offering fixed server capacity", "By limiting traffic to a set quota", "By requiring manual provisioning"],
    correct: "By automatically scaling resources based on demand",
  },
  {
    question: "Which service is used to manage secrets?",
    options: ["AWS Secrets Manager", "Amazon KMS", "AWS Systems Manager", "AWS Certificate Manager"],
    correct: "AWS Secrets Manager",
  },
  {
    question: "What is AWS Snowball used for?",
    options: ["Transferring large amounts of data during migrations", "Running serverless functions", "Hosting websites", "Managing user permissions"],
    correct: "Transferring large amounts of data during migrations",
  },
  {
    question: "Which AWS product does NOT protect your network at an organizational level?",
    options: ["AWS Network Firewall", "AWS Shield", "AWS WAF", "Amazon Route 53"],
    correct: "AWS Network Firewall",
  },
  {
    question: "Which AWS service is used for domain name registration?",
    options: ["Amazon Route 53", "AWS CloudMap", "Amazon CloudFront", "AWS Certificate Manager"],
    correct: "Amazon Route 53",
  },
  {
    question: "Which AWS service provides managed container orchestration using Docker?",
    options: ["Amazon ECS", "Amazon EKS", "AWS Fargate", "Amazon Lambda"],
    correct: "Amazon ECS",
  },
  {
    question: "Which AWS service helps you manage application deployment pipelines?",
    options: ["AWS CodePipeline", "AWS CodeDeploy", "AWS CodeBuild", "AWS CodeCommit"],
    correct: "AWS CodePipeline",
  },
  {
    question: "Which AWS service is used to detect threats and malicious activity?",
    options: ["Amazon GuardDuty", "AWS Shield", "AWS Config", "Amazon Inspector"],
    correct: "Amazon GuardDuty",
  },
  {
    question: "Which AWS service provides a fully managed API creation and management platform?",
    options: ["Amazon API Gateway", "AWS AppSync", "AWS Lambda", "AWS App Runner"],
    correct: "Amazon API Gateway",
  },
  {
    question: "Which AWS service is used for real-time application monitoring and tracing?",
    options: ["AWS X-Ray", "Amazon CloudWatch", "AWS CloudTrail", "Amazon Inspector"],
    correct: "AWS X-Ray",
  },
  {
    question: "Which AWS service allows you to run containers without managing servers?",
    options: ["AWS Fargate", "Amazon EC2", "Amazon EKS", "Amazon ECS"],
    correct: "AWS Fargate",
  },
  {
    question: "Which AWS service is used to store and retrieve secrets like passwords and API keys?",
    options: ["AWS Secrets Manager", "AWS Systems Manager", "AWS Certificate Manager", "Amazon S3"],
    correct: "AWS Secrets Manager",
  },
  {
    question: "Which AWS service helps you visualize and analyze billing data?",
    options: ["AWS Cost Explorer", "AWS Budgets", "AWS Billing Dashboard", "AWS Trusted Advisor"],
    correct: "AWS Cost Explorer",
  },
  {
    question: "Which AWS service is used for email sending and notification services?",
    options: ["Amazon Simple Email Service (SES)", "Amazon SNS", "Amazon Pinpoint", "AWS Step Functions"],
    correct: "Amazon Simple Email Service (SES)",
  },
];

function answerLabel(index: number) {
  return ["A", "B", "C", "D"][index] ?? "";
}

export default function AWSGameClient() {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    const correctCount = questions.reduce((count, question, index) => {
      if (selectedAnswers[index] === question.correct) {
        return count + 1;
      }
      return count;
    }, 0);

    return {
      correct: correctCount,
      wrong: questions.length - correctCount,
    };
  }, [selectedAnswers]);

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-lg shadow-cyan-950/20">
          <h1 className="text-4xl font-bold text-cyan-200">AWS Cloud Practitioner Essentials Game</h1>
          <p className="mt-3 text-slate-400">Answer the questions below. Each question has A/B/C/D choices.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {questions.map((question, questionIndex) => {
              const selected = selectedAnswers[questionIndex];
              const isCorrect = selected === question.correct;

              return (
                <div key={questionIndex} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm shadow-slate-950/10">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">Question {questionIndex + 1}</p>
                      <h2 className="mt-3 text-lg font-semibold text-slate-100">{question.question}</h2>
                    </div>
                    {submitted && (
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isCorrect ? "bg-emerald-500/20 text-emerald-200" : "bg-rose-500/20 text-rose-200"}`}>
                        {isCorrect ? "Correct" : "Wrong"}
                      </span>
                    )}
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {question.options.map((option, optionIndex) => {
                      const label = answerLabel(optionIndex);
                      const checked = selected === option;
                      const isAnswer = submitted && question.correct === option;
                      const isSelectedWrong = submitted && selected === option && option !== question.correct;

                      return (
                        <label
                          key={option}
                          className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                            checked ? "border-cyan-400 bg-cyan-500/10" : "border-slate-700 bg-slate-950"
                          } ${isAnswer ? "border-emerald-400 bg-emerald-500/10" : ""} ${isSelectedWrong ? "border-rose-400 bg-rose-500/10" : ""}`}
                        >
                          <input
                            type="radio"
                            name={`question-${questionIndex}`}
                            value={option}
                            checked={checked}
                            onChange={() => handleAnswerChange(questionIndex, option)}
                            className="h-4 w-4 accent-cyan-400"
                          />
                          <span className="font-semibold text-cyan-100">{label}.</span>
                          <span className="text-slate-200">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Submit
            </button>
            {submitted && (
              <div className="rounded-3xl bg-slate-900/80 px-5 py-4 text-sm text-slate-200 shadow-lg shadow-cyan-950/10">
                <p className="font-semibold text-cyan-200">Result</p>
                <p className="mt-2">Correct: {score.correct} / {questions.length}</p>
                <p>Wrong: {score.wrong} / {questions.length}</p>
              </div>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}
