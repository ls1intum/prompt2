import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Course Configuration',
    description: (
      <>
        Build your course by assembling various course phases to suit your specific teaching needs. 
        Create a flexible structure that adapts to your requirements.
      </>
    ),
  },
  {
    title: 'Application Management',
    description: (
      <>
        Streamline the application process for courses, making it easier for students to apply 
        and for instructors to manage and review applications efficiently.
      </>
    ),
  },
  {
    title: 'Student Management',
    description: (
      <>
        Efficiently manage student information and course participation with built-in tools 
        for tracking and organizing participants throughout the course lifecycle.
      </>
    ),
  },
];

function Feature({title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <Heading as="h2" className="text--center margin-bottom--lg">
          Core Features
        </Heading>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
